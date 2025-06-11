// src/app/dashboard/DashboardClient.tsx

"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Dumbbell, User } from 'lucide-react';
import { Profile, WorkoutRow } from '@/lib/types';
import RestDayCard from './RestDayCard'; // Make sure this path is correct

type SetData = { weight: string; completed: boolean };
type WorkoutProgress = { [exerciseName: string]: SetData[] };

type DashboardClientProps = { 
  userProfile: Profile; 
  fullWorkoutPlan: WorkoutRow[]; 
};

const quotes = [ "Success is the sum of small efforts repeated day in and day out." ];

export default function DashboardClient({ userProfile, fullWorkoutPlan = [] }: DashboardClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState("");

  // --- THIS IS THE KEY LOGIC BLOCK ---
  // It derives everything needed for the UI from the raw props.
  const { dayNumber, todaysExercises, isRestDay, dayTitle } = useMemo(() => {
    const dayNumber = (userProfile.current_streak || 0) + 1;

    // 1. Get all entries for today from the full plan.
    const todaysPlanEntries = fullWorkoutPlan.filter(row => row && parseInt(row.Day, 10) === dayNumber);
    
    // 2. A day is a REST day if there's a plan, but NONE of the entries have an exercise name.
    const isRestDay = todaysPlanEntries.length > 0 && !todaysPlanEntries.some(row => row.ExerciseName && row.ExerciseName.trim() !== '');
    
    // 3. The "workout" is the list of entries that DO have an exercise name.
    const todaysExercises = isRestDay ? [] : todaysPlanEntries.filter(row => row.ExerciseName && row.ExerciseName.trim() !== '');
    
    // 4. Get the title from the first entry for today.
    const dayTitle = todaysPlanEntries[0]?.DayTitle || 'Challenge Complete!';

    return { dayNumber, todaysExercises, isRestDay, dayTitle };
  }, [fullWorkoutPlan, userProfile.current_streak]);
  
  // This state is for tracking checked boxes and weights.
  const initialProgress = useMemo(() => {
    const progress: WorkoutProgress = {};
    todaysExercises.forEach(exercise => {
      const numSets = parseInt(exercise.Sets, 10) || 0;
      progress[exercise.ExerciseName] = Array.from({ length: numSets }, () => ({
        weight: "",
        completed: false
      }));
    });
    return progress;
  }, [todaysExercises]);
  
  const [workoutProgress, setWorkoutProgress] = useState<WorkoutProgress>(initialProgress);

  useEffect(() => { setMotivationalQuote(quotes[0]); }, []);

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
  
  const isDayCompletable = useMemo(() => {
    if (isRestDay) return true;
    if (todaysExercises.length === 0) return false;
    return Object.values(workoutProgress).every(sets => sets.every(set => set.completed));
  }, [isRestDay, todaysExercises.length, workoutProgress]);

  const handleCompleteDay = async () => {
    setIsLoading(true);
    try {
        const { error } = await supabase.rpc('mark_day_complete', {
            day_number_param: dayNumber,
            workout_data_param: workoutProgress,
        });
        if (error) throw error;
        toast({ title: "Day Complete!", description: `Awesome! Day ${dayNumber} is in the books.` });
        if (dayNumber >= 45) router.push('/certificate');
        else router.refresh();
    } catch (error: any) {
        toast({ title: "Error", description: `Failed to save progress: ${error.message}`, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const restDayInfo = useMemo(() => {
    if (!isRestDay) return null;
    return {
      DayFocus: dayTitle,
      notes: [ "Rest is when you get stronger.", "Hydrate and eat well.", "Prepare for tomorrow." ]
    };
  }, [isRestDay, dayTitle]);

  // This JSX preserves your original style and structure perfectly.
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* --- Your Header JSX --- */}
      <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4">
          <div className="flex justify-between items-center">
            <div><h1 className="text-xl font-bold">Hi {userProfile.name}</h1><p className="text-gray-600">Day {dayNumber} of 45</p></div>
            <div className="text-right"><div className="flex items-center justify-end gap-2"><span role="img">🔥</span><span className="font-bold text-primary text-xl">{userProfile.current_streak || 0}</span></div><p className="text-sm text-gray-600">day streak</p></div>
          </div>
          <div className="mt-3"><Badge variant="outline" className="text-sm">{userProfile.workout_routine === 'Gym' ? '🏋️ Gym' : '🏠 Home'} Routine</Badge></div>
      </div>
      
      <div className="px-4 py-6 space-y-6">
        {/* --- Your Motivational Quote Card JSX --- */}
        <Card><CardContent className="pt-6 text-center"><p className="text-lg font-medium text-gray-900 mb-2">💬 Daily Motivation</p><p className="text-gray-600 italic">"{motivationalQuote}"</p></CardContent></Card>
        
        <Card>
          <CardHeader><CardTitle>Today's Task: {dayTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {isRestDay && restDayInfo ? (
              <RestDayCard dayInfo={restDayInfo} />
            ) : todaysExercises.length > 0 ? (
              todaysExercises.map((exercise) => (
                <div key={exercise.ExerciseName} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{exercise.ExerciseName}</h3>
                    <Badge variant="secondary">{exercise.Sets} × {exercise.Reps}</Badge>
                  </div>
                  <div className="space-y-2">
                    {workoutProgress[exercise.ExerciseName]?.map((setData, setIndex) => (
                      <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                        <label htmlFor={`${exercise.ExerciseName}-${setIndex}`} className="col-span-2 text-sm font-medium cursor-pointer">Set {setIndex + 1}</label>
                        <div className="col-span-5"><Input type="number" placeholder="kg" value={setData.weight} onChange={(e) => updateWeight(exercise.ExerciseName, setIndex, e.target.value)} className="h-9" disabled={userProfile.workout_routine !== 'Gym'}/></div>
                        <div className="col-span-5 flex items-center justify-end space-x-2"><Checkbox id={`${exercise.ExerciseName}-${setIndex}`} checked={setData.completed} onCheckedChange={(checked) => updateSetCompletion(exercise.ExerciseName, setIndex, !!checked)}/><label htmlFor={`${exercise.ExerciseName}-${setIndex}`} className="text-sm font-medium">Done</label></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-4">Congratulations on completing the challenge!</p>
            )}
            
            {(isRestDay || todaysExercises.length > 0) && (
              <Button onClick={handleCompleteDay} className="w-full h-12 text-lg" disabled={!isDayCompletable || isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Mark Day as Complete"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- Your Bottom Navigation JSX --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-20">
          <div className="grid grid-cols-2 gap-1 p-2">
            <Button variant="secondary" className="h-14 flex flex-col gap-1"><Dumbbell size={24}/><span className="text-xs font-semibold">Dashboard</span></Button>
            <Button variant="ghost" className="h-14 flex flex-col gap-1" onClick={() => router.push('/profile')}><User size={24}/><span className="text-xs font-semibold">Profile</span></Button>
          </div>
      </div>
    </div>
  );
}