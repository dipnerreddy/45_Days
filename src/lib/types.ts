// src/lib/types.ts

// This is the NEW type definition matching your CSV file.
// It replaces any previous WorkoutRow or WorkoutExercise type.
export type WorkoutRow = {
  Day: string;
  DayTitle: string;
  DayFocus: string;
  Category: 'Main' | 'Core'; // You can expand this if you add more categories
  ExerciseName: string;
  Sets: string;
  Reps: string;
  'Cardio / Notes': string; // The quotes are important because of the '/' and spaces
};

// The Profile type remains the same
export type Profile = {
  id: string;
  name: string | null;
  current_streak: number | null;
  workout_routine: 'Home' | 'Gym' | null;
};