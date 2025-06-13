// src/app/profile/ProfileClient.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { createClient } from '@/lib/supabase/client';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, Dumbbell, LogOut, Award, Lock, Unlock, Pencil, RefreshCw, Edit } from "lucide-react";

// Type Imports
import { Profile } from '@/lib/types';

type ProfileClientProps = {
  userProfile: Profile & { email: string };
};

export default function ProfileClient({ userProfile }: ProfileClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  // State for all edit dialogs and loading states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const [isRoutineDialogOpen, setIsRoutineDialogOpen] = useState(false);
  
  // State for the editable values
  const [newName, setNewName] = useState(userProfile.name);
  // const [newWeight, setNewWeight] = useState(userProfile.current_weight.toString());
  const [newWeight, setNewWeight] = useState(userProfile.current_weight?.toString() || '');
  const [newRoutine, setNewRoutine] = useState(userProfile.workout_routine);

  // --- TASK 1: Handle Name Update ---
  const handleUpdateName = async () => {
    if (!newName || newName.trim().length < 2) {
      toast({ title: "Invalid Name", description: "Name must be at least 2 characters.", variant: "destructive" });
      return;
    }
    setIsUpdating(true);
    const { error } = await supabase.from('profiles').update({ name: newName.trim() }).eq('id', userProfile.id);
    setIsUpdating(false);

    if (error) {
      toast({ title: "Error", description: "Failed to update name.", variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Your name has been updated." });
      setIsNameDialogOpen(false);
      router.refresh();
    }
  };
  
  // --- Handle Weight Update (Existing Logic) ---
  const handleUpdateWeight = async () => {
    const weightValue = parseFloat(newWeight);
    if (isNaN(weightValue) || weightValue <= 30) {
        toast({ title: "Invalid Weight", description: "Please enter a valid weight > 30 kg.", variant: "destructive" });
        return;
    }
    setIsUpdating(true);
    const { error } = await supabase.from('profiles').update({ current_weight: weightValue }).eq('id', userProfile.id);
    setIsUpdating(false);

    if (error) {
        toast({ title: "Error", description: "Failed to update weight.", variant: "destructive" });
    } else {
        toast({ title: "Success!", description: "Your weight has been updated." });
        setIsWeightDialogOpen(false);
        router.refresh();
    }
  };

  // Add this helper function
  const calculateAge = (dateString: string | null): number | string => {
    if (!dateString) {
        return 'N/A'; // If dob is null or an empty string, return 'N/A'
    }
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

  // --- TASK 2: Handle Routine Change ---
  const handleChangeRoutine = async () => {
    if (newRoutine === userProfile.workout_routine) {
        setIsRoutineDialogOpen(false);
        return;
    }
    setIsUpdating(true);
    const { error } = await supabase.rpc('change_routine_and_reset', { new_routine: newRoutine });
    setIsUpdating(false);

    if (error) {
        toast({ title: "Error", description: `Could not change routine: ${error.message}`, variant: "destructive" });
    } else {
        toast({ title: "Routine Changed!", description: "Your routine has been updated and progress has been reset." });
        setIsRoutineDialogOpen(false);
        router.push('/dashboard'); // Go to dashboard to see the change
        router.refresh();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged Out" });
    router.push('/');
    router.refresh();
  };

  // const isCertificateUnlocked = userProfile.current_streak >= 45;
  const isCertificateUnlocked = (userProfile.current_streak ?? 0) >= 45;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4">
        <h1 className="text-xl font-bold">Your Profile</h1>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Card 1: Challenge Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Challenge Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{(userProfile.current_streak ?? 0)  + 1}/45</div>
                <div className="text-sm text-muted-foreground">Current Day</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{userProfile.current_streak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
            {/* --- TASK 2: Functional Routine Changer --- */}
            <Dialog open={isRoutineDialogOpen} onOpenChange={setIsRoutineDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-between items-center text-sm py-2 h-auto">
                    <span>Routine: <span className="font-bold">{userProfile.workout_routine === 'Gym' ? '🏋️ Gym' : '🏠 Home'}</span></span>
                    <div className="flex items-center gap-2 text-primary">
                        <Edit size={14}/> Change
                    </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Your Workout Routine</DialogTitle>
                  <DialogDescription className="pt-2">
                    <span className="font-bold text-destructive">Warning:</span> Switching your routine will reset all challenge progress to Day 1.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label>New Routine</Label>
                  {/* <Select onValueChange={(value: 'Home' | 'Gym') => setNewRoutine(value)} defaultValue={userProfile.workout_routine}> */}
                  <Select onValueChange={(value: 'Home' | 'Gym') => setNewRoutine(value)} defaultValue={userProfile.workout_routine || undefined}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Home">🏠 Home</SelectItem>
                          <SelectItem value="Gym">🏋️ Gym</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsRoutineDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleChangeRoutine} disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm & Reset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Card 2: Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {/* --- TASK 1: Editable Name --- */}
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Name:</span>
                <div className="flex items-center gap-2">
                    <span className="font-medium">{userProfile.name}</span>
                    <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-6 w-6"><Pencil className="h-3 w-3"/></Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Update Your Name</DialogTitle></DialogHeader>
                            <Input placeholder="Enter your full name" value={newName || ''} onChange={(e) => setNewName(e.target.value)} />
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsNameDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateName} disabled={isUpdating}>
                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Age:</span> <span className="font-medium">{calculateAge(userProfile.dob)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Gender:</span> <span className="font-medium capitalize">{userProfile.gender}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Weight:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{userProfile.current_weight} kg</span>
                <Dialog open={isWeightDialogOpen} onOpenChange={setIsWeightDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-6 w-6"><Pencil className="h-3 w-3"/></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Update Your Weight</DialogTitle></DialogHeader>
                        <Input type="number" placeholder="e.g., 75.5" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} />
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsWeightDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateWeight} disabled={isUpdating}>
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email:</span> <span className="font-medium">{userProfile.email}</span></div>
          </CardContent>
        </Card>

        {/* Card 3: Certificate Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award /> Certificate Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full justify-between" onClick={() => isCertificateUnlocked && router.push('/certificate')} disabled={!isCertificateUnlocked}>
              <span>View Completion Certificate</span>
              {isCertificateUnlocked ? <Unlock className="h-5 w-5 text-green-500"/> : <Lock className="h-5 w-5 text-muted-foreground"/>}
            </Button>
            {!isCertificateUnlocked && 
                <p className="text-xs text-center mt-2 text-muted-foreground">
                    Complete 45 consecutive days to unlock.
                </p>
            }
          </CardContent>
        </Card>
        
        {/* --- TASK 4: Large Logout Button --- */}
       <Button 
          variant="default" // Use the default variant to get the solid background
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90" // Custom classes for color
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
        
        {/* --- TASK 3: Danger Zone Removed --- */}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="grid grid-cols-2 gap-1 p-2">
          <Button variant="ghost" className="h-12 flex flex-col" onClick={() => router.push('/dashboard')}>
            <Dumbbell size={20}/>
            <span className="text-xs">Dashboard</span>
          </Button>
          <Button variant="secondary" className="h-12 flex flex-col">
            <User size={20}/>
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}