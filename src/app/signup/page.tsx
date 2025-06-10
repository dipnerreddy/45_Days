// /src/app/signup/page.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [initialWeight, setInitialWeight] = useState('');
  const [height, setHeight] = useState('');
  const [workoutRoutine, setWorkoutRoutine] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state for better UX

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // --- Validations (No changes here) ---
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false); return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 80) {
      setError("Age must be between 13 and 80.");
      setIsLoading(false); return;
    }
    const weightNum = parseFloat(initialWeight);
    if (isNaN(weightNum) || weightNum <= 30) {
      setError("Weight must be greater than 30 kg.");
      setIsLoading(false); return;
    }
    const heightNum = parseInt(height, 10);
    if (isNaN(heightNum) || heightNum <= 100) {
      setError("Please enter a valid height greater than 100 cm.");
      setIsLoading(false); return;
    }
    if (!workoutRoutine) {
      setError("Please select a workout routine.");
      setIsLoading(false); return;
    }

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, age: ageNum, gender, initial_weight: weightNum, height: heightNum, workout_routine: workoutRoutine },
      },
    });

    setIsLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else {
      // --- THIS IS THE KEY CHANGE ---
      // On success, redirect to the login page with the email as a query parameter.
      const searchParams = new URLSearchParams({ email: email, message: "Signup successful! Please log in." });
      router.push(`/login?${searchParams.toString()}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Begin your transformation in just 45 days.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Form is unchanged */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* All input fields remain the same */}
            <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="age">Age</Label><Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="gender">Gender</Label><Select onValueChange={setGender} value={gender} required><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent></Select></div></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="weight">Weight (kg)</Label><Input id="weight" type="number" step="0.1" placeholder="e.g., 75.5" value={initialWeight} onChange={(e) => setInitialWeight(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="height">Height (cm)</Label><Input id="height" type="number" placeholder="e.g., 180" value={height} onChange={(e) => setHeight(e.target.value)} required /></div></div>
            <div className="space-y-2"><Label htmlFor="routine">Workout Routine (This choice is permanent)</Label><Select onValueChange={setWorkoutRoutine} value={workoutRoutine} required><SelectTrigger><SelectValue placeholder="Choose your path..." /></SelectTrigger><SelectContent><SelectItem value="Home">🏠 Home Workout</SelectItem><SelectItem value="Gym">🏋️ Gym Workout</SelectItem></SelectContent></Select></div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">Already have an account? <Link href="/login" className="underline">Login</Link></div>
        </CardContent>
      </Card>
    </div>
  );
}