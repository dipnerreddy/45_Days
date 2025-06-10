"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Dumbbell, Target, HeartPulse } from 'lucide-react';

import { parseExercises } from '@/lib/utils';
import ExerciseCard from './ExerciseCard';

type Profile = { name: string | null; current_streak: number | null; workout_routine: string | null; };
type WorkoutRow = { [key: string]: any; Day: string; 'Workout Type': string; 'Muscle Group / Focus': string; Exercises: string; 'Core Exercises': string; 'Cardio / Notes': string; };
type DashboardClientProps = { userProfile: Profile; workoutPlan: WorkoutRow[]; };
type CompletionState = { [exerciseName:string]: boolean[]; };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function DashboardClient({ userProfile, workoutPlan }: DashboardClientProps) {
  const dayNumber = userProfile.current_streak ? userProfile.current_streak + 1 : 1;
  const todaysWorkout = workoutPlan.find(w => parseInt(w.Day) === dayNumber);

  const mainExercises = useMemo(() => todaysWorkout ? parseExercises(todaysWorkout.Exercises) : [], [todaysWorkout]);
  const coreExercises = useMemo(() => todaysWorkout ? parseExercises(todaysWorkout['Core Exercises']) : [], [todaysWorkout]);
  
  const [completionState, setCompletionState] = useState<CompletionState>({});

  const handleSetCompletionChange = (exerciseName: string, setIndex: number, isCompleted: boolean) => {
    setCompletionState(prevState => {
      const newExerciseSets = [...(prevState[exerciseName] || [])];
      newExerciseSets[setIndex] = isCompleted;
      return { ...prevState, [exerciseName]: newExerciseSets };
    });
  };

  const allExercises = [...mainExercises, ...coreExercises];
  const isDayComplete = allExercises.length > 0 && allExercises.every(ex => 
    completionState[ex.name]?.length === ex.sets && completionState[ex.name].every(Boolean)
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <motion.div
        className="mx-auto max-w-2xl space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Hi {userProfile.name || 'User'}!</CardTitle>
                  <CardDescription className="text-lg">Day {dayNumber} of 45</CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
                  <span className="text-2xl font-bold">{userProfile.current_streak || 0}</span>
                  <span className="text-lg">🔥</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {todaysWorkout ? (
          <>
            <motion.div variants={itemVariants}>
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Dumbbell className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle>{todaysWorkout['Workout Type']}</CardTitle>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {(todaysWorkout['Muscle Group / Focus'] || '').split(',').map(muscle => (
                          <span key={muscle} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{muscle.trim()}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mainExercises.map((exercise, index) => (
                    <ExerciseCard
                      key={exercise.name}
                      exercise={exercise}
                      exerciseNumber={index + 1}
                      routine={userProfile.workout_routine}
                      exerciseState={completionState[exercise.name] || []}
                      onSetCompletionChange={(setIndex, isCompleted) => handleSetCompletionChange(exercise.name, setIndex, isCompleted)}
                    />
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {coreExercises.length > 0 && (
              <motion.div variants={itemVariants}>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-xl font-semibold">Core Finisher</h3>
                  </div>
                  {coreExercises.map((exercise, index) => (
                     <ExerciseCard
                        key={exercise.name}
                        exercise={exercise}
                        exerciseNumber={index + 1}
                        routine={userProfile.workout_routine}
                        exerciseState={completionState[exercise.name] || []}
                        onSetCompletionChange={(setIndex, isCompleted) => handleSetCompletionChange(exercise.name, setIndex, isCompleted)}
                      />
                  ))}
                </div>
              </motion.div>
            )}

            {todaysWorkout['Cardio / Notes'] && (
              <motion.div variants={itemVariants}>
                <Separator className="my-6" />
                 <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <HeartPulse className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-xl font-semibold">Cardio & Notes</h3>
                  </div>
                  <p className="rounded-md border bg-card p-4 text-muted-foreground">{todaysWorkout['Cardio / Notes']}</p>
                </div>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Button size="lg" className="w-full text-lg shadow-lg" disabled={!isDayComplete}>
                Mark Day {dayNumber} Complete
              </Button>
            </motion.div>
          </>
        ) : (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <p className="text-center">Challenge complete or no workout for today. Well done!</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}