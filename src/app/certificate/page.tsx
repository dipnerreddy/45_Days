// src/app/certificate/page.tsx

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import CertificateDisplay from '@/components/certificate/CertificateDisplay';

export default async function CertificatePage() {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('name, current_streak, workout_routine')
    .eq('id', user.id)
    .single();

  // --------------------------------------------------------------------
  // --- ✅ LOCK RE-ENABLED FOR PRODUCTION ✅ ---
  //
  // This 'if' block is now active. It checks if the user's profile exists
  // and if their streak is 45 or more. If not, it redirects them.
  //
  if (!profile || profile.current_streak < 45) {
    console.log(`Redirecting user ${user.id}: Streak is ${profile?.current_streak || 0}, which is less than 45.`);
    redirect('/dashboard'); 
  }
  // --------------------------------------------------------------------

  // This data will now only be generated for users who have earned it.
  const certificateData = {
    name: profile.name || 'Fitness Champion',
    routine: profile.workout_routine || 'Home',
    completionDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    // ✅ Official-looking IDs (no more 'TEST' prefix)
    certificateId: `45-${user.id.substring(0, 8)}-${user.id.substring(9, 13)}`,
    certificateUrl: `your-app.com/share/${user.id}`,
    referenceNumber: `${profile.current_streak}-${user.id.substring(24, 28)}`,
  };

  return <CertificateDisplay data={certificateData} />;
}