import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ParsedExercise = {
  name: string;
  sets: number;
  reps: number | string; // Reps can be a number or a string like "AMRAP"
};

/**
 * Parses a string of exercises into an array of objects.
 * @param exercisesString - e.g., "Push-ups: 4x8, Squats: 4x10-12, Plank: 3xAMRAP"
 * @returns An array of ParsedExercise objects.
 */
export function parseExercises(exercisesString: string): ParsedExercise[] {
  if (!exercisesString) return [];

  return exercisesString.split(',').map((part) => {
    const [name, setsReps] = part.split(':').map(s => s.trim());
    
    if (!name || !setsReps) {
      return { name: part.trim(), sets: 1, reps: 'N/A' }; // Handle simple text like "30 min run"
    }

    const [sets, reps] = setsReps.split('x').map(s => s.trim());
    
    return {
      name,
      sets: parseInt(sets, 10) || 1, // Default to 1 set if parsing fails
      reps: reps || 'N/A',
    };
  }).filter(exercise => exercise.name); // Filter out any empty results
}