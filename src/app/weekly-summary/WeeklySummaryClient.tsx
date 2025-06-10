// app/weekly-summary/WeeklySummaryClient.tsx
"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, Bar, CartesianGrid } from 'recharts';
import { User, Calendar, Dumbbell, Activity, Star } from 'lucide-react';

// Define the shape of our data props
type WeightData = { log_date: string; weight: number };
type ProgressData = { workout_date: string; is_completed: boolean };

type WeeklySummaryClientProps = {
  initialWeightData: WeightData[];
  initialProgressData: ProgressData[];
};

const quotes = [
    "A week of effort is a week of progress.",
    "Look back at your week with pride, and forward with hope.",
    "Consistency over one week is the blueprint for success over a year.",
    "Don't let one bad day spoil a week of good work."
];

export default function WeeklySummaryClient({ initialWeightData, initialProgressData }: WeeklySummaryClientProps) {
  const router = useRouter();

  // Process data for charts using useMemo for performance
  const { weightChartData, completionChartData, daysCompleted } = useMemo(() => {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result = [];
    
    // Create a template for the last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayLabel = dayLabels[date.getDay()];
        const dateString = date.toISOString().split('T')[0];
        
        const weightEntry = initialWeightData.find(d => d.log_date === dateString);
        const progressEntry = initialProgressData.find(d => d.workout_date === dateString);

        result.push({
            name: dayLabel, // For chart labels
            date: dateString,
            weight: weightEntry ? weightEntry.weight : null,
            completed: progressEntry?.is_completed ? 1 : 0,
        });
    }

    const daysCompleted = result.filter(d => d.completed === 1).length;
    
    return { 
        weightChartData: result, 
        completionChartData: result,
        daysCompleted
    };
  }, [initialWeightData, initialProgressData]);

  const completionRate = ((daysCompleted / 7) * 100).toFixed(0);
  const quoteOfTheWeek = quotes[new Date().getDay() % quotes.length];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-6 pb-24">
        <Card>
          <CardHeader>
            <CardTitle>Your Weekly Summary</CardTitle>
            <CardDescription>A look at your progress over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-3xl font-bold text-primary">{daysCompleted}/7</p>
                <p className="text-sm text-muted-foreground">Days Completed</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-3xl font-bold text-primary">{completionRate}%</p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Dumbbell size={20} /> Weight Progress (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#FF5722" strokeWidth={2} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity size={20} /> Workout Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={completionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{fill: 'rgba(255, 87, 34, 0.1)'}} />
                <Bar dataKey="completed" fill="#FF5722" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Star size={20} /> Quote of the Week</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center italic text-muted-foreground">"{quoteOfTheWeek}"</p>
            </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="grid grid-cols-3 gap-1 p-2">
            <Button variant="ghost" className="h-12 flex flex-col" onClick={() => router.push('/dashboard')}>
                <Dumbbell size={20}/>
                <span className="text-xs">Dashboard</span>
            </Button>
            <Button variant="secondary" className="h-12 flex flex-col">
                <Calendar size={20}/>
                <span className="text-xs">Summary</span>
            </Button>
            <Button variant="ghost" className="h-12 flex flex-col" onClick={() => router.push('/profile')}>
                <User size={20}/>
                <span className="text-xs">Profile</span>
            </Button>
        </div>
      </div>
    </div>
  );
}