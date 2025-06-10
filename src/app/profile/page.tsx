// src/app/profile/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ProfileClient from './ProfileClient';
import { Profile } from '@/lib/types'; // Import the main Profile type

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch all columns from the profiles table for the current user
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*') 
    .eq('id', user.id)
    .single<Profile>(); // Use the imported Profile type here for type safety

  if (profileError || !profileData) {
    console.error("Profile fetch error:", profileError?.message);
    return <div>Error loading profile. Please try again.</div>;
  }

  // Combine the profile data with the user's email from the auth object
  const userProfileWithEmail = {
    ...profileData,
    email: user.email || 'No email provided',
  };

  return <ProfileClient userProfile={userProfileWithEmail} />;
}