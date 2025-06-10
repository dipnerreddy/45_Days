import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Papa from 'papaparse';
import DashboardClient from './DashboardClient';
import { WorkoutRow, Profile } from '@/lib/types'; // Using the types from our last session

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
    return <div>Error: Could not load your profile. Please try again.</div>;
  }
  
  const workoutUrl = process.env.WORKOUT_PLAN_URL;
  if (!workoutUrl) {
    return <div>Error: The Workout Plan URL is not configured.</div>;
  }

  let fullWorkoutPlan: WorkoutRow[] = [];
  try {
    const response = await fetch(workoutUrl, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`Network response was not ok`);
    
    const csvText = await response.text();
    const result = Papa.parse<WorkoutRow>(csvText, { header: true, skipEmptyLines: true });
    fullWorkoutPlan = result.data;
  } catch (e) {
    console.error("Failed to fetch or parse workout data:", e);
    return <div>Error: Could not load the workout plan.</div>;
  }

  // Pass all data to the client component which will render the UI
  return <DashboardClient userProfile={profile} fullWorkoutPlan={fullWorkoutPlan} />;
}