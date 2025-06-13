// src/app/certificate/page.tsx

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import CertificateDisplay from '@/components/certificate/CertificateDisplay';
import { Profile } from '@/lib/types';

export default async function CertificatePage() {
  // --- START OF DEBUGGING ---
  console.log("\n--- CERTIFICATE PAGE SERVER COMPONENT ---");
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log("No user found. Redirecting to /login.");
    redirect('/login');
  }

  console.log(`Authenticated User ID: ${user.id}`);

  // Fetch the latest profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, current_streak, workout_routine, credential_id')
    .eq('id', user.id)
    .single<Profile>();
  
  // Log the raw result from Supabase
  console.log("Raw profile data from Supabase:", profile);
  if (profileError) {
    console.error("Supabase profile fetch error:", profileError.message);
  }

  // Check the condition for the redirect
  // const shouldRedirect = !profile || profile.current_streak < 45;
  const shouldRedirect = !profile || (profile.current_streak ?? 0) < 45;
  
  console.log(`Checking redirect condition...`);
  console.log(`Does profile exist? ${!!profile}`);
  console.log(`Profile streak value: ${profile?.current_streak}`);
  console.log(`Type of streak: ${typeof profile?.current_streak}`);
  console.log(`Is streak < 45? ${profile ? (profile.current_streak ?? 0) < 45 : 'N/A'}`);
  console.log(`FINAL DECISION: Should redirect? ${shouldRedirect}`);
  // --- END OF DEBUGGING ---

  if (shouldRedirect) {
    console.log("Condition met. REDIRECTING to /dashboard now.");
    redirect('/dashboard');
  }
  
  console.log("Condition NOT met. Rendering certificate.");

  // If the code reaches here, the redirect did not happen.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const credentialId = profile.credential_id || profile.id;
  const credentialUrl = `${siteUrl}/share/${credentialId}`;

  const certificateData = {
    name: profile.name || 'Fitness Champion',
    routine: profile.workout_routine || 'Home',
    completionDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }),
    credentialUrl: credentialUrl,
    credentialId: credentialId,
  };

  return <CertificateDisplay data={certificateData} />;
}