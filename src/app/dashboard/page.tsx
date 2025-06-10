// src/app/dashboard/page.tsx

import { redirect } from 'next/navigation';
import { createClient as createServer } from '@/lib/supabase/server';
import Papa from 'papaparse';
import { cookies } from 'next/headers'; // Import cookies directly
import DashboardClient from './DashboardClient';

// Define types for our data for better code quality
type Profile = {
  id: string;
  name: string | null;
  current_streak: number | null;
  workout_routine: string | null;
  // Add other profile fields if needed
};

type Workout = {
  [key: string]: any;
  'Exercise Title': string;
};

// This function will fetch the user profile and workout plan together
async function getDashboardData(userId: string): Promise<{ profile: Profile; workoutPlan: Workout[] }> {
  const supabase = createServer();
  
  // 1. Fetch the user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error("Could not load your profile. Please try again.");
  }

  // 2. Select the correct workout URL
  const workoutUrl = profile.workout_routine === 'Gym'
    ? process.env.GYM_WORKOUT_URL
    : process.env.HOME_WORKOUT_URL;

  if (!workoutUrl) {
    throw new Error("Workout URL is not configured.");
  }

  let workoutPlan: Workout[] = [];
  try {
    // 3. Fetch and parse the workout data
    const response = await fetch(workoutUrl, { next: { revalidate: 3600 } }); // Cache for 1 hour
    const csvText = await response.text();
    const parsedData = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data as Workout[];
    workoutPlan = parsedData;
  } catch (e) {
    console.error("Failed to fetch or parse workout data:", e);
    throw new Error("Could not load the workout plan.");
  }
  
  return { profile, workoutPlan };
}


// This is the main page component
export default async function DashboardPage() {
  // First, we create the client to check authentication.
  // This is the only place it will be used directly in this component.
  const cookieStore = cookies() // Explicitly call cookies() at the top level
  const supabase = createServer()

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  try {
    // Now that we know the user exists, we fetch all other data
    const { profile, workoutPlan } = await getDashboardData(user.id);
    
    // Pass the fetched data to the client component
    return <DashboardClient userProfile={profile} workoutPlan={workoutPlan} />;

  } catch (error) {
    // A centralized error handler for a better user experience
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg border bg-card p-6 text-center text-destructive">
          <h2 className="text-xl font-semibold">Error Loading Dashboard</h2>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }
}