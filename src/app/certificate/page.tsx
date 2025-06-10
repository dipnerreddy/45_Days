// app/certificate/page.tsx

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CertificateDisplay from '@/components/certificate/CertificateDisplay';

export default async function CertificatePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('name, current_streak, workout_routine')
    .eq('id', user.id)
    .single();

  // 🔐 SECURITY CHECK: The most important part of this page.
  // If the user's streak is less than 45, redirect them to the dashboard.
  if (!profile || profile.current_streak < 45) {
    redirect('/dashboard');
  }

  const certificateData = {
    name: profile.name,
    routine: profile.workout_routine,
    completionDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  // The user's public ID is needed for the shareable link.
  const userId = user.id;

  return <CertificateDisplay data={certificateData} userId={userId} />;
}