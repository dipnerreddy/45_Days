// // src/app/certificate/page.tsx

// import { redirect } from 'next/navigation';
// import { createClient } from '@/lib/supabase/server';
// import CertificateDisplay from '@/components/certificate/CertificateDisplay';

// export default async function CertificatePage() {
//   const supabase = createClient();

//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) {
//     redirect('/login');
//   }

//   // Fetch the user's real profile data. This will work even if their streak is low.
//   const { data: profile, error } = await supabase
//     .from('profiles')
//     .select('name, current_streak, workout_routine')
//     .eq('id', user.id)
//     .single();

//   // --------------------------------------------------------------------
//   // --- 🔐 TEMPORARY TESTING MODIFICATION 🔐 ---
//   //
//   // The following 'if' block is commented out. This allows you to access
//   // the /certificate page directly without having a streak of 45.
//   //
//   // ⚠️ REMEMBER TO UNCOMMENT THIS BLOCK BEFORE DEPLOYING TO PRODUCTION! ⚠️
//   /*
//   if (!profile || profile.current_streak < 45) {
//     console.log("Redirect blocked for testing. User does not meet criteria but is allowed to view certificate page.");
//     // redirect('/dashboard'); 
//   }
//   */
//   // --------------------------------------------------------------------


//   // Create mock/placeholder data to ensure the certificate always renders,
//   // even if the profile data is incomplete or the user is new.
//   const certificateData = {
//     name: profile?.name || 'Your Name Here', // Uses real name if available, otherwise a placeholder
//     routine: profile?.workout_routine || 'Home', // Uses real routine or a placeholder
//     completionDate: new Date().toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     }),
//   };

//   const userId = user.id;

//   return <CertificateDisplay data={certificateData} userId={userId} />;
// }


//////////////////////////////////////////////////////////////////////////////////////////////////////////


// src/app/certificate/page.tsx

// import { redirect } from 'next/navigation';
// // ❌ REMOVED: import { createClient } from '@/lib/supabase/server';
// import { createSupabaseServerClient } from '@/lib/supabase/server'; // ✅ ADDED: The correct import
// import CertificateDisplay from '@/components/certificate/CertificateDisplay';

// export default async function CertificatePage() {
//   // ✅ THE FIX: Call the new helper function here
//   const supabase = createSupabaseServerClient();

//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) {
//     redirect('/login');
//   }

//   const { data: profile, error } = await supabase
//     .from('profiles')
//     .select('name, current_streak, workout_routine')
//     .eq('id', user.id)
//     .single();

//   // --------------------------------------------------------------------
//   // --- 🔐 Production Safety Check 🔐 ---
//   // This ensures only users with a >= 45 day streak can see the page.
//   // We leave it active for production.
//   if (!profile || profile.current_streak < 45) {
//     // For testing, you can comment out the redirect to view the page.
//     // console.log("User does not meet criteria. Redirecting to dashboard.");
//     redirect('/dashboard');
//   }
//   // --------------------------------------------------------------------

//   // ✅ NEW: Generate the official-looking certificate data
//   const certificateData = {
//     name: profile?.name || 'Fitness Champion',
//     routine: profile?.workout_routine || 'Home',
//     completionDate: new Date().toLocaleDateString('en-US', {
//       year: 'numeric', month: 'long', day: 'numeric',
//     }),
//     // Mimic the Udemy certificate format
//     certificateId: `UC-45DC-${user.id.substring(0, 8)}-${user.id.substring(9, 13)}`,
//     certificateUrl: `your-app-url.com/share/${user.id}`, // Replace with your actual domain
//     referenceNumber: `CHLG-00${profile.current_streak}-${user.id.substring(24, 28)}`,
//   };

//   return <CertificateDisplay data={certificateData} />;
// }




//////////////////////////////////////////////////////////////////////////////////////////////////////



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

  // Fetch the user's profile data. This will still work even if their streak is low.
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, current_streak, workout_routine')
    .eq('id', user.id)
    .single();

  // --------------------------------------------------------------------
  // --- 🔐 TEMPORARY TESTING MODIFICATION 🔐 ---
  //
  // The following 'if' block is commented out. This allows you to access
  // the /certificate page directly without needing a streak of 45.
  //
  // ⚠️ REMEMBER TO UNCOMMENT THIS BLOCK BEFORE DEPLOYING TO PRODUCTION! ⚠️
  /*
  if (!profile || profile.current_streak < 45) {
    // This console log is useful for when you re-enable the check.
    console.log("Redirect check is active. User does not meet criteria, redirecting...");
    redirect('/dashboard'); 
  }
  */
  // --------------------------------------------------------------------


  // We create certificate data regardless of the streak for testing.
  // This uses the real profile data if available, otherwise it uses safe placeholders.
  const certificateData = {
    name: profile?.name || 'Your Name Here',
    routine: profile?.workout_routine || 'Home',
    completionDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    certificateId: `UC-TEST-${user.id.substring(0, 8)}-${user.id.substring(9, 13)}`,
    certificateUrl: `your-app.com/share/${user.id}`, // Use a placeholder domain for now
    referenceNumber: `TEST-0000-${user.id.substring(24, 28)}`,
  };

  return <CertificateDisplay data={certificateData} />;
}