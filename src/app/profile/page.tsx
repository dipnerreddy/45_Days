// app/profile/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileClient from './ProfileClient';
import { Profile } from '@/lib/types'; // Assuming you have this type

export default async function ProfilePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch the complete profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, weight_history(log_date)') // Fetch all profile fields and the log_date from weight_history
    .eq('id', user.id)
    .order('log_date', { foreignTable: 'weight_history', ascending: false })
    .limit(1, { foreignTable: 'weight_history' })
    .single();

  if (error || !profile) {
    console.error("Profile fetch error:", error?.message);
    return <div>Error loading profile. Please try again.</div>;
  }
  
  // Extract the last update date from the nested structure
  const lastWeightUpdate = profile.weight_history[0]?.log_date || null;
  
  // Create a clean profile object to pass to the client
  const userProfile = {
      ...profile,
      last_weight_update: lastWeightUpdate,
  };


  return <ProfileClient userProfile={userProfile} />;
}