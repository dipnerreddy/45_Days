// src/app/profile/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch the profile data
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*') // Select all columns from the profiles table
    .eq('id', user.id)
    .single();

  if (profileError || !profileData) {
    console.error("Profile fetch error:", profileError?.message);
    return <div>Error loading profile. Please try again.</div>;
  }

  // Combine the profile data with the user's email from the auth object
  const userProfile = {
    ...profileData,
    email: user.email || 'No email provided', // Add the email here
  };

  return <ProfileClient userProfile={userProfile} />;
}