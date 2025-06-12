"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>(''); // Set specific types for gender
  const [initialWeight, setInitialWeight] = useState('');
  const [height, setHeight] = useState('');
  const [workoutRoutine, setWorkoutRoutine] = useState<'Home' | 'Gym' | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // --- Validations ---
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false); return;
    }
    const ageNum = calculateAge(dob);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 80) {
      setError("You must be between 13 and 80 years old to join.");
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
    if (!workoutRoutine) { setError("Please select a workout routine."); setIsLoading(false); return; }
    if (!gender) { setError("Please select your gender."); setIsLoading(false); return; } // Validation for gender

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, gender, initial_weight: weightNum, height: heightNum, workout_routine: workoutRoutine, dob },
      },
    });

    setIsLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else {
      toast({
          title: "Signup Successful!",
          description: "Please check your email to verify your account, then log in."
      });
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join the Challenge</CardTitle>
          <CardDescription>Begin your transformation in just 45 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            
            <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
            </div>
            
            {/* ✅ NEW: Gender selection using RadioGroup */}
            <div className="space-y-3">
              <Label>Gender</Label>
              <RadioGroup 
                onValueChange={(value: 'Male' | 'Female') => setGender(value)} 
                value={gender} 
                className="grid grid-cols-2 gap-4"
              >
                <Label className="flex items-center justify-center space-x-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                    <RadioGroupItem value="Male" id="male" />
                    <span className="font-semibold">Male</span>
                </Label>
                <Label className="flex items-center justify-center space-x-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                    <RadioGroupItem value="Female" id="female" />
                    <span className="font-semibold">Female</span>
                </Label>
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="weight">Weight (kg)</Label><Input id="weight" type="number" step="0.1" placeholder="e.g., 75.5" value={initialWeight} onChange={(e) => setInitialWeight(e.target.value)} required /></div>
                <div className="space-y-2"><Label htmlFor="height">Height (cm)</Label><Input id="height" type="number" placeholder="e.g., 180" value={height} onChange={(e) => setHeight(e.target.value)} required /></div>
            </div>

            <div className="space-y-3">
              <Label>Workout Routine (This choice is permanent)</Label>
              <RadioGroup 
                onValueChange={(value: 'Home' | 'Gym') => setWorkoutRoutine(value)} 
                value={workoutRoutine} 
                className="grid grid-cols-2 gap-4"
              >
                <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                    <RadioGroupItem value="Home" id="home" className="sr-only" />
                    <span className="text-2xl">🏠</span>
                    <span className="font-semibold">Home</span>
                </Label>
                <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                    <RadioGroupItem value="Gym" id="gym" className="sr-only" />
                    <span className="text-2xl">🏋️</span>
                    <span className="font-semibold">Gym</span>
                </Label>
              </RadioGroup>
            </div>
            
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Joining...' : 'Join the Challenge'}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">Already have an account? <Link href="/login" className="underline">Login</Link></div>
        </CardContent>
      </Card>
    </div>
  );
}