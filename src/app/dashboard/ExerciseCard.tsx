"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutRow } from "@/lib/types";

// Type for the data of a single set
export type SetData = {
  weight: string;
  reps: string;
  completed: boolean;
};

type ExerciseCardProps = {
  exercise: WorkoutRow;
  setsData: SetData[];
  onSetDataChange: (setIndex: number, newSetData: SetData) => void;
};

export default function ExerciseCard({ exercise, setsData, onSetDataChange }: ExerciseCardProps) {
  const numberOfSets = parseInt(exercise.Sets, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{exercise.ExerciseName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Header Row */}
          <div className="grid grid-cols-4 items-center gap-2 text-xs font-semibold text-muted-foreground">
            <div className="col-span-1">SET</div>
            <div className="col-span-1">WEIGHT (KG)</div>
            <div className="col-span-1">REPS</div>
            <div className="col-span-1 text-right">DONE</div>
          </div>

          {/* Data Rows for each set */}
          {Array.from({ length: numberOfSets }).map((_, setIndex) => {
            const setData = setsData[setIndex] || { weight: '', reps: exercise.Reps, completed: false };
            
            return (
              <div
                key={setIndex}
                className="grid grid-cols-4 items-center gap-2 rounded-lg p-2 transition-colors has-[:checked]:bg-green-50"
              >
                <div className="col-span-1 font-bold">Set {setIndex + 1}</div>
                <div className="col-span-1">
                  <Input
                    type="number"
                    placeholder="0"
                    className="h-9"
                    value={setData.weight}
                    onChange={(e) => onSetDataChange(setIndex, { ...setData, weight: e.target.value })}
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    type="number"
                    className="h-9"
                    value={setData.reps}
                    onChange={(e) => onSetDataChange(setIndex, { ...setData, reps: e.target.value })}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Checkbox
                    className="h-6 w-6"
                    checked={setData.completed}
                    onCheckedChange={(checked) => onSetDataChange(setIndex, { ...setData, completed: !!checked })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}