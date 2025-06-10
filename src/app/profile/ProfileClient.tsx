// app/profile/ProfileClient.tsx
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { createClient } from '@/lib/supabase/client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, User, Award, Lock, Unlock, Trash2, Gauge, Scale, Calendar, LineChart, FireExtinguisher, Pencil , LogOut, Dumbbell} from "lucide-react";

// Assuming a more complete Profile type from page.tsx
type ProfileWithDetails = {
  id: string;
  name: string;
  age: number;
  current_weight: number;
  height_cm: number | null;
  current_streak: number;
  last_weight_update: string | null;
};

type ProfileClientProps = {
  userProfile: ProfileWithDetails;
};

// Reusable component for displaying info cards
const InfoCard = ({ icon, title, value, subtext, onEdit }: { icon: React.ReactNode, title: string, value: string, subtext?: string, onEdit?: () => void }) => (
    <div className="flex items-center space-x-4 rounded-lg border p-4 relative">
        <div className="text-primary">{icon}</div>
        <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-lg font-semibold">{value}</p>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </div>
        {onEdit && (
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
            </Button>
        )}
    </div>
);

// New component for the Weight Update Dialog
function UpdateWeightDialog({ currentWeight, userId }: { currentWeight: number, userId: string }) {
    const [newWeight, setNewWeight] = useState(currentWeight.toString());
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const supabase = createClient();

    const handleUpdate = async () => {
        const weightValue = parseFloat(newWeight);
        if (isNaN(weightValue) || weightValue <= 30) {
            toast({ title: "Invalid Weight", description: "Please enter a valid weight greater than 30 kg.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        // Step 1: Update the profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ current_weight: weightValue })
            .eq('id', userId);

        // Step 2: Add an entry to the weight_history table
        const { error: historyError } = await supabase
            .from('weight_history')
            .insert({ user_id: userId, weight: weightValue, log_date: new Date().toISOString() });
        
        setIsLoading(false);

        if (profileError || historyError) {
            toast({ title: "Error", description: "Failed to update weight. Please try again.", variant: "destructive" });
        } else {
            toast({ title: "Success!", description: "Your weight has been updated." });
            setIsOpen(false);
            router.refresh(); // Refetch server data to show the new weight
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Your Weight</DialogTitle>
                    <DialogDescription>
                        Enter your current weight in kilograms (kg). This will be logged for your weekly summary.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input 
                        type="number"
                        placeholder="e.g., 75.5"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Weight
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function ProfileClient({ userProfile }: ProfileClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [isResetting, setIsResetting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const bmi = useMemo(() => {
    if (!userProfile.current_weight || !userProfile.height_cm) {
      return null;
    }
    const heightInMeters = userProfile.height_cm / 100;
    const calculatedBmi = userProfile.current_weight / (heightInMeters * heightInMeters);
    return calculatedBmi.toFixed(1);
  }, [userProfile.current_weight, userProfile.height_cm]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
    router.refresh(); // Clear any cached user data
  };

  const handleResetProgress = async () => {
    setIsResetting(true);
    const { error } = await supabase.rpc('reset_user_progress');
    setIsResetting(false);

    if (error) {
      toast({ title: "Error", description: `Could not reset progress: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: "Progress Reset!", description: "Your challenge has been reset to Day 1." });
      setIsResetDialogOpen(false); // Close the dialog on success
      router.push('/dashboard'); // Go to dashboard to see the change
      router.refresh(); // Force a server-side data refetch
    }
  };

  const isCertificateUnlocked = userProfile.current_streak >= 45;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-6 pb-24">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2"><User /> {userProfile.name}</CardTitle>
              {/* 3. Add the Logout button here */}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
            <CardDescription>Your personal fitness profile and stats.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
              <InfoCard icon={<FireExtinguisher size={24} />} title="Current Streak" value={`${userProfile.current_streak} days`} />
              <InfoCard icon={<Gauge size={24} />} title="BMI" value={bmi || "N/A"} subtext={!bmi ? "Set height to calculate" : ""} />
              <InfoCard icon={<User size={24} />} title="Age" value={`${userProfile.age} years`} />
              {/* Weight Card with Update Dialog */}
              <div className="relative">
                <InfoCard 
                    icon={<Scale size={24} />} 
                    title="Weight" 
                    value={`${userProfile.current_weight} kg`} 
                    subtext={userProfile.last_weight_update ? `Updated: ${new Date(userProfile.last_weight_update).toLocaleDateString()}` : "Not updated yet"} 
                />
                <UpdateWeightDialog currentWeight={userProfile.current_weight} userId={userProfile.id} />
              </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award /> Challenge Status</CardTitle>
            </CardHeader>
            <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full justify-between" 
                  onClick={() => isCertificateUnlocked && router.push('/certificate')}
                  disabled={!isCertificateUnlocked}
                >
                    <span>View Completion Certificate</span>
                    {isCertificateUnlocked ? <Unlock className="h-5 w-5 text-green-500"/> : <Lock className="h-5 w-5 text-muted-foreground"/>}
                </Button>
                {!isCertificateUnlocked && <p className="text-xs text-center mt-2 text-muted-foreground">Complete 45 consecutive days to unlock.</p>}
            </CardContent>
            
        </Card>

        <Alert variant="destructive">
          <Trash2 className="h-4 w-4" />
          <AlertTitle>Danger Zone</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>This will reset your streak to 0.</span>
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">Reset Progress</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently reset your
                            challenge progress and your streak will be set to 0.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleResetProgress} disabled={isResetting}>
                            {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Yes, reset my progress
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </AlertDescription>
        </Alert>
      </div>

      {/* Bottom Navigation Bar */}
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