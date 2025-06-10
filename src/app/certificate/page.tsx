// src/app/certificate/page.tsx

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CertificateDisplay from '@/components/certificate/CertificateDisplay';

export default async function CertificatePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch the user's real profile data. This will work even if their streak is low.
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('name, current_streak, workout_routine')
    .eq('id', user.id)
    .single();

  // --------------------------------------------------------------------
  // --- 🔐 TEMPORARY TESTING MODIFICATION 🔐 ---
  //
  // The following 'if' block is commented out. This allows you to access
  // the /certificate page directly without having a streak of 45.
  //
  // ⚠️ REMEMBER TO UNCOMMENT THIS BLOCK BEFORE DEPLOYING TO PRODUCTION! ⚠️
  /*
  if (!profile || profile.current_streak < 45) {
    console.log("Redirect blocked for testing. User does not meet criteria but is allowed to view certificate page.");
    // redirect('/dashboard'); 
  }
  */
  // --------------------------------------------------------------------


  // Create mock/placeholder data to ensure the certificate always renders,
  // even if the profile data is incomplete or the user is new.
  const certificateData = {
    name: profile?.name || 'Your Name Here', // Uses real name if available, otherwise a placeholder
    routine: profile?.workout_routine || 'Home', // Uses real routine or a placeholder
    completionDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  const userId = user.id;

  return <CertificateDisplay data={certificateData} userId={userId} />;
}