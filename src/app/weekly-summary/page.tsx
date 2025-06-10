// app/weekly-summary/page.tsx

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WeeklySummaryClient from './WeeklySummaryClient';

export default async function WeeklySummaryPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Calculate the date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  // Fetch weight history for the last 7 days
  const { data: weightData, error: weightError } = await supabase
    .from('weight_history')
    .select('log_date, weight')
    .eq('user_id', user.id)
    .gte('log_date', sevenDaysAgoISO)
    .order('log_date', { ascending: true });
    
  // Fetch daily progress for the last 7 days
  const { data: progressData, error: progressError } = await supabase
    .from('daily_progress')
    .select('workout_date, is_completed')
    .eq('user_id', user.id)
    .gte('workout_date', sevenDaysAgoISO);

  if (weightError || progressError) {
    console.error("Data fetching error:", weightError || progressError);
    return <div>Error loading summary data. Please try again.</div>
  }

  return (
    <WeeklySummaryClient 
      initialWeightData={weightData || []} 
      initialProgressData={progressData || []}
    />
  );
}