// src/lib/types.ts

// This type matches the structure of a row in your Google Sheets CSV.
export type WorkoutRow = {
  Day: string;
  DayTitle: string;
  DayFocus: string;
  Category: 'Main' | 'Core' | string; // Allow for other categories
  ExerciseName: string;
  Sets: string;
  Reps: string;
  'Cardio / Notes': string;
};

// This is the complete Profile type, reflecting all fields in your
// 'profiles' table in the Supabase database.
export type Profile = {
  id: string;                   // From auth.users
  name: string | null;
  dob: string | null;           // Date of Birth
  gender: string | null;
  initial_weight: number | null;
  current_weight: number | null;
  height_cm: number | null;
  workout_routine: 'Home' | 'Gym' | null;
  challenge_start_date: string | null; // timestamptz
  current_streak: number | null;
  timezone: string | null;
  last_completed_day: string | null; // date
  created_at: string;           // timestamptz
  credential_id: string | null; // For the shareable certificate URL
};