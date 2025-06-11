// src/app/dashboard/DashboardClient.tsx

"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// UI Components
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Dumbbell, User } from 'lucide-react';

// Type definitions
import { Profile, WorkoutRow } from '@/lib/types';

// Define the shape of our detailed progress state
type SetData = { weight: string; completed: boolean };
type WorkoutProgress = { [exerciseName: string]: SetData[] };

type DashboardClientProps = { 
  userProfile: Profile; 
  fullWorkoutPlan: WorkoutRow[]; 
};

// A small, static list of motivational quotes
const quotes = [
    "Every workout brings you closer to your goal.",
    "Discipline is choosing between what you want now and what you want most.",
    "The only bad workout is the one that didn't happen.",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "Success is the sum of small efforts repeated day in and day out."
];

export default function DashboardClient({ userProfile, fullWorkoutPlan }: DashboardClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState("");

  const dayNumber = (userProfile.current_streak || 0) + 1;

  // Memoize the workout plan for today's exercises
  const todaysWorkout = useMemo(() => 
    fullWorkoutPlan.filter(row => 
      row && parseInt(row.Day, 10) === dayNumber && row.ExerciseName
    ), [fullWorkoutPlan, dayNumber]);

  // Create the initial state for progress tracking based on today's workout
  const initialProgress = useMemo(() => {
    const progress: WorkoutProgress = {};
    todaysWorkout.forEach(exercise => {
      const numSets = parseInt(exercise.Sets, 10) || 0;
      progress[exercise.ExerciseName] = Array.from({ length: numSets }, () => ({
        weight: "",
        completed: false
      }));
    });
    return progress;
  }, [todaysWorkout]);
  
  const [workoutProgress, setWorkoutProgress] = useState<WorkoutProgress>(initialProgress);

  // Set the daily quote when the component mounts
  useEffect(() => {
    // Use the date to pick a quote, so it changes daily
    const quoteIndex = new Date().getDate() % quotes.length;
    setMotivationalQuote(quotes[quoteIndex]);
  }, []);

  const updateSetCompletion = (exerciseName: string, setIndex: number, completed: boolean) => {
    setWorkoutProgress(prev => {
      const newSets = [...prev[exerciseName]];
      newSets[setIndex] = { ...newSets[setIndex], completed };
      return { ...prev, [exerciseName]: newSets };
    });
  };

  const updateWeight = (exerciseName: string, setIndex: number, weight: string) => {
    setWorkoutProgress(prev => {
      const newSets = [...prev[exerciseName]];
      newSets[setIndex] = { ...newSets[setIndex], weight };
      return { ...prev, [exerciseName]: newSets };
    });
  };

  // Memoize the calculation for whether the entire workout is complete
  const isWorkoutComplete = useMemo(() => {
    if (Object.keys(workoutProgress).length === 0 && todaysWorkout.length > 0) {
      return false; // Not complete if there are workouts but no progress tracked yet
    }
    return Object.values(workoutProgress).every(sets =>
      sets.every(set => set.completed)
    );
  }, [workoutProgress, todaysWorkout]);

  const handleCompleteWorkout = async () => {
    if (!isWorkoutComplete) {
      toast({ title: "Incomplete Workout", description: "Please check all boxes to complete the workout.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // ✅ CORRECTED RPC CALL: Removed user_id_param.
      // The database function gets the user ID securely from the session.
      const { error } = await supabase.rpc('mark_day_complete', {
        day_number_param: dayNumber,
        workout_data_param: workoutProgress,
      });

      if (error) {
        // This will catch errors from the database function itself
        throw error;
      }

      toast({ title: "Day Complete!", description: `Awesome work! Day ${dayNumber} is in the books.` });
      
      // Navigate or refresh
      if (dayNumber >= 45) {
        router.push('/certificate');
      } else {
        // Refresh the page to show the updated streak
        router.refresh(); 
      }

    } catch (error: any) {
      // This will catch both network errors and database errors
      console.error("Failed to complete workout:", error);
      toast({ title: "Error", description: `Failed to save progress: ${error.message}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24"> {/* Increased padding-bottom */}
      {/* Sticky Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Hi {userProfile.name}</h1>
            <p className="text-gray-600">Day {dayNumber} of 45</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span role="img" aria-label="fire">🔥</span>
              <span className="font-bold text-primary text-xl">{userProfile.current_streak || 0}</span>
            </div>
            <p className="text-sm text-gray-600">day streak</p>
          </div>
        </div>
        <div className="mt-3">
          <Badge variant="outline" className="text-sm">
            {userProfile.workout_routine === 'Gym' ? '🏋️ Gym' : '🏠 Home'} Routine
          </Badge>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Motivational Quote Card */}
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">💬 Daily Motivation</p>
            <p className="text-gray-600 italic">"{motivationalQuote}"</p>
          </CardContent>
        </Card>

        {/* Today's Workout Card */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Workout: {todaysWorkout[0]?.DayTitle || 'Rest Day'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {todaysWorkout.length === 0 ? (
              <p className="text-gray-600 text-center py-4">Looks like a rest day. Enjoy it!</p>
            ) : (
              todaysWorkout.map((exercise) => (
                <div key={exercise.ExerciseName} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{exercise.ExerciseName}</h3>
                    <Badge variant="secondary">{exercise.Sets} × {exercise.Reps}</Badge>
                  </div>
                  
                  {/* Per-set tracking */}
                  <div className="space-y-2">
                    {workoutProgress[exercise.ExerciseName]?.map((setData, setIndex) => (
                      <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                        <label htmlFor={`${exercise.ExerciseName}-${setIndex}`} className="col-span-2 text-sm font-medium cursor-pointer">Set {setIndex + 1}</label>
                        <div className="col-span-5">
                          <Input
                            type="number"
                            placeholder="kg"
                            value={setData.weight}
                            onChange={(e) => updateWeight(exercise.ExerciseName, setIndex, e.target.value)}
                            className="h-9"
                            disabled={userProfile.workout_routine !== 'Gym'}
                          />
                        </div>
                        <div className="col-span-5 flex items-center justify-end space-x-2">
                          <Checkbox
                            id={`${exercise.ExerciseName}-${setIndex}`}
                            checked={setData.completed}
                            onCheckedChange={(checked) => updateSetCompletion(exercise.ExerciseName, setIndex, !!checked)}
                          />
                          <label htmlFor={`${exercise.ExerciseName}-${setIndex}`} className="text-sm font-medium">Done</label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            
            {todaysWorkout.length > 0 && (
              <Button onClick={handleCompleteWorkout} className="w-full h-12 text-lg" disabled={!isWorkoutComplete || isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Mark Day as Complete"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-20">
        <div className="grid grid-cols-2 gap-1 p-2">
            <Button variant="secondary" className="h-14 flex flex-col gap-1">
                <Dumbbell size={24}/>
                <span className="text-xs font-semibold">Dashboard</span>
            </Button>
            <Button variant="ghost" className="h-14 flex flex-col gap-1" onClick={() => router.push('/profile')}>
                <User size={24}/>
                <span className="text-xs font-semibold">Profile</span>
            </Button>
        </div>
      </div>
    </div>
  );
}