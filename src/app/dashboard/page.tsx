// src/app/dashboard/page.tsx

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server'; // ✅ ADDED: Import the new helper
import Papa from 'papaparse';
import DashboardClient from './DashboardClient';
import { WorkoutRow, Profile } from '@/lib/types';


/**
 * Normalizes the workout data from the CSV.
 * (This function is correct and remains unchanged)
 */
const normalizeWorkoutData = (data: WorkoutRow[]): WorkoutRow[] => {
  let lastDay = '';
  let lastDayTitle = '';
  let lastDayFocus = '';

  const filledData = data.map(row => {
    const newRow = { ...row };
    if (newRow.Day && newRow.Day.trim() !== '') {
      lastDay = newRow.Day;
      lastDayTitle = newRow.DayTitle;
      lastDayFocus = newRow.DayFocus;
    } else {
      newRow.Day = lastDay;
      newRow.DayTitle = lastDayTitle;
      newRow.DayFocus = lastDayFocus;
    }
    return newRow;
  });

  return filledData.filter(row => row.ExerciseName && row.ExerciseName.trim() !== '');
};

export default async function DashboardPage() {
  // ✅ THE FIX: Call the new helper function here instead of createClient()
  const supabase = createSupabaseServerClient(); 

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
    return <div>Error: Could not load your profile. Please try logging in again.</div>;
  }
  
  const workoutUrl = process.env.WORKOUT_PLAN_URL;
  if (!workoutUrl) {
    console.error("Missing environment variable: WORKOUT_PLAN_URL");
    return <div>Error: The Workout Plan URL is not configured by the administrator.</div>;
  }

  let fullWorkoutPlan: WorkoutRow[] = [];
  try {
    const response = await fetch(workoutUrl, { next: { revalidate: 3600 } }); 
    if (!response.ok) {
      throw new Error(`Network response was not ok, status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const parsedResult = Papa.parse<WorkoutRow>(csvText, { header: true, skipEmptyLines: true });
    
    if (parsedResult.errors.length > 0) {
      console.error('CSV Parsing Errors:', parsedResult.errors);
    }

    fullWorkoutPlan = normalizeWorkoutData(parsedResult.data);

  } catch (e) {
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