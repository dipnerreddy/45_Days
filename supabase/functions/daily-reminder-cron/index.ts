import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

Deno.serve(async (_req) => {
  try {
    const todayUTC = new Date().toISOString().split('T')[0];
    const { data: profilesToRemind } = await supabase.from('profiles')
      .select('id, name, email, timezone, current_streak')
      .neq('last_completed_day', todayUTC).gt('current_streak', 0);
    
    if (!profilesToRemind || profilesToRemind.length === 0) {
        return new Response("OK - No users to remind.");
    }
    for (const profile of profilesToRemind) {
      const userTimezone = profile.timezone || 'UTC';
      const currentHour = parseInt(new Date().toLocaleTimeString('en-US', { timeZone: userTimezone, hour: '2-digit', hour12: false }));
      
      // ✅ UPDATED: Changed from 19 to 18 to trigger at 6 PM IST
      if (currentHour === 18) { 
        await resend.emails.send({
          from: 'Challenge Bot <onboarding@resend.dev>', to: profile.email,
          subject: 'Friendly reminder for your challenge!',
          html: `Hi ${profile.name},<br><br>Just a heads-up that you still need to complete your task for Day ${profile.current_streak + 1}. Don't lose that streak!`,
        });
      }
    }
    return new Response("OK");
  } catch (error) {
    console.error("Error in reminder cron:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});