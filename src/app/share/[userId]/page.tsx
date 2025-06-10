// app/share/[userId]/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

type Props = {
  params: { userId: string };
};

// This function generates the metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const userId = params.userId;
  const supabase = createClient();

  // Fetch the user's name to personalize the social media preview
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single();

  const userName = profile?.name || 'A Challenger';
  const title = `${userName} Completed the 45-Day Fitness Challenge!`;
  const description = 'Join the challenge and start your own transformation journey.';
  
  // Use the reliable NEXT_PUBLIC_SITE_URL or a fallback for localhost
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // THE FIX: Point to the new API route for the dynamic image
  const imageUrl = `${siteUrl}/api/og/${userId}`;

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


// The actual page component that users see
export default function SharePage({ params }: Props) {
  // This page's main purpose is to serve the metadata above for social crawlers.
  // For human visitors, it provides a simple landing page and a link back to the app.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-primary">45-Day Fitness Challenge</h1>
            <p className="mt-2 text-lg text-gray-700">Certificate of Achievement</p>
            <p className="mt-4 text-gray-600">You are viewing a shared certificate. Ready to start your own journey?</p>
            {/* IMPROVEMENT: Use a Link component for standard navigation */}
            <Link href="/" passHref>
                <Button className="mt-6">Visit the App</Button>
            </Link>
        </div>
    </div>
  );
}