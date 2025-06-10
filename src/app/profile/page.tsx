// src/app/profile/page.tsx
import { redirect } from 'next/navigation';
// ❌ REMOVED: import { createClient } from '@/lib/supabase/server';
import { createSupabaseServerClient } from '@/lib/supabase/server'; // ✅ ADDED: The correct import
import ProfileClient from './ProfileClient';
import { Profile } from '@/lib/types'; // It's good practice to import your types

export default async function ProfilePage() {
  // ✅ THE FIX: Call the new helper function here
  const supabase = createSupabaseServerClient();

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
  // Casting to Profile helps with type safety in the client component
  const userProfile = {
    ...profileData,
    email: user.email || 'No email provided',
  } as Profile & { email: string };

  return <ProfileClient userProfile={userProfile} />;
}