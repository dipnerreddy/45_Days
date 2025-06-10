import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Papa from 'papaparse';
import DashboardClient from './DashboardClient';
import { WorkoutRow, Profile } from '@/lib/types';


/**
 * Normalizes the workout data from the CSV.
 * The CSV export from Google Sheets leaves the 'Day' column blank for subsequent
 * exercises of the same day. This function fills in those blanks.
 * @param data The raw data parsed from PapaParse.
 * @returns A clean array of WorkoutRow where every row has a 'Day' value.
 */
const normalizeWorkoutData = (data: WorkoutRow[]): WorkoutRow[] => {
  let lastDay = '';
  let lastDayTitle = '';
  let lastDayFocus = '';

  const filledData = data.map(row => {
    // Create a new copy of the row to avoid mutating the original
    const newRow = { ...row };

    // If the Day column is not blank, it's a new group.
    // Update our trackers with its values.
    if (newRow.Day && newRow.Day.trim() !== '') {
      lastDay = newRow.Day;
      lastDayTitle = newRow.DayTitle;
      lastDayFocus = newRow.DayFocus;
    } else {
      // If the Day column is blank, fill it and the other relevant
      // columns with the last valid values we saw.
      newRow.Day = lastDay;
      newRow.DayTitle = lastDayTitle;
      newRow.DayFocus = lastDayFocus;
    }
    return newRow;
  });

  // Finally, remove any rows that don't have an exercise name to be safe
  return filledData.filter(row => row.ExerciseName && row.ExerciseName.trim() !== '');
};

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, current_streak, workout_routine')
    .eq('id', user.id)
    .single<Profile>();

  if (profileError || !profile) {
    console.error('Profile fetch error:', profileError?.message);
    // You could redirect to a logout/error page or show a message
    return <div>Error: Could not load your profile. Please try logging in again.</div>;
  }
  
  const workoutUrl = process.env.WORKOUT_PLAN_URL;
  if (!workoutUrl) {
    console.error("Missing environment variable: WORKOUT_PLAN_URL");
    return <div>Error: The Workout Plan URL is not configured by the administrator.</div>;
  }

  let fullWorkoutPlan: WorkoutRow[] = [];
  try {
    // Fetch the workout plan from the Google Sheets CSV URL
    // Revalidate every hour to get potential updates to the plan
    const response = await fetch(workoutUrl, { next: { revalidate: 3600 } }); 
    if (!response.ok) {
      throw new Error(`Network response was not ok, status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const parsedResult = Papa.parse<WorkoutRow>(csvText, { header: true, skipEmptyLines: true });
    
    // Check for parsing errors
    if (parsedResult.errors.length > 0) {
      console.error('CSV Parsing Errors:', parsedResult.errors);
    }

    // Use the normalization function to clean the data
    fullWorkoutPlan = normalizeWorkoutData(parsedResult.data);

  } catch (e) {
    // Log the full error for debugging
    if (e instanceof Error) {
        console.error("Failed to fetch or parse workout data:", e.message);
    } else {
        console.error("An unknown error occurred while fetching workout data:", e);
    }
    return <div>Error: Could not load the workout plan. Please check your connection or try again later.</div>;
  }

  // Pass the clean, normalized profile and workout data to the client component for rendering
  return <DashboardClient userProfile={profile} fullWorkoutPlan={fullWorkoutPlan} />;
}