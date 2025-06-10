// src/app/dashboard/ExerciseCard.tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParsedExercise } from "@/lib/utils";

type ExerciseCardProps = {
  exercise: ParsedExercise;
  exerciseNumber: number; // <-- ADD THIS PROP
  routine: string | null;
  exerciseState: boolean[];
  onSetCompletionChange: (setIndex: number, isCompleted: boolean) => void;
};

export default function ExerciseCard({ exercise, exerciseNumber, routine, exerciseState, onSetCompletionChange }: ExerciseCardProps) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Exercise Number */}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {exerciseNumber}
          </span>
          {/* Exercise Name */}
          <div>
            <h3 className="text-lg font-semibold">{exercise.name}</h3>
            <p className="text-sm font-medium text-muted-foreground">{exercise.sets} sets × {exercise.reps} reps</p>
          </div>
        </div>
      </div>

      {routine === 'Gym' && (
        <div className="pl-11"> {/* Indent the weight input to align with text */}
          <div className="space-y-2">
            <Label htmlFor={`${exercise.name}-weight`} className="text-xs text-muted-foreground">Weight (kg)</Label>
            <Input id={`${exercise.name}-weight`} type="number" placeholder="0" className="h-9" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pl-11 sm:grid-cols-4">
        {Array.from({ length: exercise.sets }).map((_, setIndex) => (
          <div key={setIndex} className="flex items-center space-x-2 rounded-md border p-2 transition-colors hover:bg-muted/50">
            <Checkbox
              id={`${exercise.name}-set-${setIndex}`}
              checked={exerciseState[setIndex] || false}
              onCheckedChange={(checked) => onSetCompletionChange(setIndex, !!checked)}
            />
            <Label htmlFor={`${exercise.name}-set-${setIndex}`} className="cursor-pointer text-sm font-medium leading-none">
              Set {setIndex + 1}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}