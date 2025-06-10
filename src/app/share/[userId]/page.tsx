// app/share/[userId]/page.tsx

import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Props = {
  params: { userId: string };
};

// This function generates the metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const userId = params.userId;
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single();

  const userName = profile?.name || 'A Challenger';
  const title = `${userName} Completed the 45-Day Fitness Challenge!`;
  const description = 'Join the challenge and start your own transformation journey.';
  
  // This is the URL to our dynamic OG image route
  const imageUrl = `${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/share/${userId}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}


// The actual page component
export default function SharePage({ params }: Props) {
  // This page can simply redirect to the main app or show a simple message
  // Its main purpose is to serve the metadata above.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
        <h1 className="text-3xl font-bold">45-Day Fitness Challenge</h1>
        <p className="mt-2 text-lg">Certificate of Achievement</p>
        <p className="mt-4">You are viewing a shared certificate. Ready to start your own journey?</p>
        <Button onClick={() => redirect('/')} className="mt-6">Visit the App</Button>
    </div>
  );
}