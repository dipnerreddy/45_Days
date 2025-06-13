// src/app/share/[userId]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

type Props = {
  params: { userId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const imageUrl = `${siteUrl}/api/og/${userId}`; // This points to our image generator

  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase.from('profiles').select('name').eq('id', userId).single();
  
  const title = `${profile?.name || 'A Challenger'} Completed the 45-Day Challenge!`;
  const description = 'View the certificate of completion and start your own transformation journey.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: 'Certificate Image' }],
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

// This is the simple page users see when they click the public URL.
export default async function SharePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold text-primary">45-Day Fitness Challenge</h1>
            <p className="mt-2 text-lg text-gray-700">Certificate of Achievement</p>
            <p className="mt-4 text-gray-600">Ready to start your own transformation journey?</p>
            <Link href="/" passHref>
                <Button className="mt-6">Visit The App</Button>
            </Link>
        </div>
    </div>
  );
}