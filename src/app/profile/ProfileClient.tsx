// src/app/profile/ProfileClient.tsx
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { createClient } from '@/lib/supabase/client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Dumbbell, LogOut, Award, Lock, Unlock, Trash2, Pencil } from "lucide-react";

// The profile data type passed from the server component
type ProfileWithDetails = {
  id: string;
  name: string;
  age: number;
  current_weight: number;
  height_cm: number | null;
  current_streak: number;
  workout_routine: 'Home' | 'Gym';
  email: string;
  gender: string;
};

type ProfileClientProps = {
  userProfile: ProfileWithDetails;
};

export default function ProfileClient({ userProfile }: ProfileClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [isResetting, setIsResetting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newWeight, setNewWeight] = useState(userProfile.current_weight.toString());
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged Out" });
    router.push('/login');
    router.refresh();
  };

  const handleResetProgress = async () => {
    setIsResetting(true);
    const { error } = await supabase.rpc('reset_user_progress');
    setIsResetting(false);

    if (error) {
      toast({ title: "Error", description: `Could not reset progress: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: "Progress Reset!", description: "Your challenge has been reset to Day 1." });
      setIsResetDialogOpen(false);
      router.push('/dashboard');
      router.refresh();
    }
  };
  
  const handleUpdateWeight = async () => {
    const weightValue = parseFloat(newWeight);
    if (isNaN(weightValue) || weightValue <= 30) {
        toast({ title: "Invalid Weight", description: "Please enter a valid weight > 30 kg.", variant: "destructive" });
        return;
    }
    setIsUpdating(true);
    // Update profiles table and add to weight_history
    const { error } = await supabase.from('profiles').update({ current_weight: weightValue }).eq('id', userProfile.id);
    const { error: historyError } = await supabase.from('weight_history').insert({ user_id: userProfile.id, weight: weightValue, log_date: new Date().toISOString() });
    setIsUpdating(false);

    if (error || historyError) {
        toast({ title: "Error", description: "Failed to update weight.", variant: "destructive" });
    } else {
        toast({ title: "Success!", description: "Your weight has been updated." });
        setIsWeightDialogOpen(false);
        router.refresh();
    }
  };

  const isCertificateUnlocked = userProfile.current_streak >= 45;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Profile</h1>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Card 1: Challenge Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Challenge Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{userProfile.current_streak + 1}/45</div>
                <div className="text-sm text-muted-foreground">Current Day</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{userProfile.current_streak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="w-full justify-center text-sm py-2">
                {userProfile.workout_routine === 'Gym' ? '🏋️ Gym' : '🏠 Home'} Routine (Locked)
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name:</span> <span className="font-medium">{userProfile.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Age:</span> <span className="font-medium">{userProfile.age}</span></div>
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
            {!isCertificateUnlocked && <p className="text-xs text-center mt-2 text-muted-foreground">Complete 45 consecutive days to unlock.</p>}
          </CardContent>
        </Card>

        {/* Card 4: Danger Zone */}
        <Alert variant="destructive">
          <Trash2 className="h-4 w-4" />
          <AlertTitle>Danger Zone</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Reset your challenge progress.</span>
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">Reset</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>This will permanently reset your progress to Day 1.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleResetProgress} disabled={isResetting}>
                    {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Yes, reset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </AlertDescription>
        </Alert>
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