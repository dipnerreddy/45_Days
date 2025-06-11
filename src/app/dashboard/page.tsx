// src/app/dashboard/page.tsx

import { redirect } from 'next/navigation';
import Papa from 'papaparse';
import DashboardClient from './DashboardClient';
import { WorkoutRow, Profile } from '@/lib/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// This helper function simply fills in the blank "Day" cells from the CSV.
// It is crucial for making the CSV data usable.
const normalizeWorkoutData = (data: WorkoutRow[]): WorkoutRow[] => {
  let lastDay = '', lastDayTitle = '', lastDayFocus = '';
  data.forEach(row => {
    if (row.Day && row.Day.trim() !== '') {
      lastDay = row.Day;
      lastDayTitle = row.DayTitle;
      lastDayFocus = row.DayFocus;
    } else {
      row.Day = lastDay;
      row.DayTitle = lastDayTitle;
      row.DayFocus = lastDayFocus;
    }
  });
  return data;
};

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient(); 

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (profileError || !profile) {
    return <div>Error: Could not load your profile. Please try logging in again.</div>;
  }
  
  // --- 1. Select the correct URL based on the user's profile ---
  let workoutUrl: string | undefined;
  if (profile.workout_routine === 'Home') {
    workoutUrl = process.env.HOME_WORKOUT_PLAN_URL;
  } else if (profile.workout_routine === 'Gym') {
    workoutUrl = process.env.GYM_WORKOUT_PLAN_URL;
  } else {
    return <div>Error: Your workout routine is not configured correctly.</div>;
  }

  if (!workoutUrl) {
    return <div>Error: The Workout Plan URL for your routine is not configured.</div>;
  }
  
  // --- 2. Fetch, parse, and normalize the data from that URL ---
  let fullWorkoutPlan: WorkoutRow[] = [];
  try {
    const response = await fetch(workoutUrl, { next: { revalidate: 3600 } }); 
    const csvText = await response.text();
    const parsedResult = Papa.parse<WorkoutRow>(csvText, { header: true, skipEmptyLines: true });
    fullWorkoutPlan = normalizeWorkoutData(parsedResult.data);
  } catch (e) {
    console.error("Failed to fetch or parse workout data:", e);
    return <div>Error: Could not load the workout plan. Please try again later.</div>;
  }

  // --- 3. Pass the RAW, complete data and profile to the client ---
  return <DashboardClient userProfile={profile} fullWorkoutPlan={fullWorkoutPlan} />;
}