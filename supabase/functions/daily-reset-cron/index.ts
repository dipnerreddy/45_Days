// supabase/functions/daily-reset-cron/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

const getYesterdayDateString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

Deno.serve(async (_req) => {
  try {
    const yesterdayDate = getYesterdayDateString();

    const { data: profilesToReset } = await supabase
      .from('profiles').select('id, name, email')
      .neq('last_completed_day', yesterdayDate).gt('current_streak', 0);

    const { data: profilesToCelebrate } = await supabase
      .from('profiles').select('id, name, email, current_streak')
      .eq('last_completed_day', yesterdayDate).gt('current_streak', 0)
      .in('current_streak', [7, 14, 21, 28, 35, 42]);
    
    if (profilesToReset && profilesToReset.length > 0) {
      console.log(`Resetting ${profilesToReset.length} users.`);
      const userIdsToReset = profilesToReset.map(p => p.id);
      await supabase.from('profiles').update({ current_streak: 0, last_completed_day: null }).in('id', userIdsToReset);
      for (const profile of profilesToReset) {
        await resend.emails.send({
          from: 'Challenge Bot <onboarding@resend.dev>', to: profile.email,
          subject: 'Your 45-Day Challenge has been Reset',
          html: `Hi ${profile.name},<br><br>You missed a day, and your challenge progress has been reset. The key to transformation is consistency. Don't be discouraged—start over strong today!`,
        });
      }
    }

    if (profilesToCelebrate && profilesToCelebrate.length > 0) {
        console.log(`Celebrating ${profilesToCelebrate.length} users.`);
        for (const profile of profilesToCelebrate) {
            await resend.emails.send({
              from: 'Challenge Bot <onboarding@resend.dev>', to: profile.email,
              subject: `🎉 You just completed Day ${profile.current_streak}!`,
              html: `Hi ${profile.name},<br><br>Incredible work! You've just crushed Day ${profile.current_streak} of the 45-Day Challenge. Keep that fire going!`,
            });
        }
    }
    return new Response("OK");
  } catch (error) {
    console.error("Error in daily reset cron:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});