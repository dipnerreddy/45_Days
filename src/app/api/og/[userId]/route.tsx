// src/app/api/og/[userId]/route.tsx

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// DO NOT ADD `export const runtime = 'edge';` HERE.
// This route MUST run on the default Node.js runtime to use the
// Supabase SSR helper function (createSupabaseServerClient).

export async function GET(
  request: NextRequest, // This signature is correct for the Node.js runtime
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  if (!userId) {
    return new Response('User ID is missing', { status: 400 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('name, workout_routine')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error(`Supabase error or user not found for ID ${userId}:`, error?.message);
      return new Response('User not found', { status: 404 });
    }

    const fontData = await fetch(
      new URL('./Inter-Bold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            border: '40px solid #FF5722',
            fontFamily: '"Inter"',
          }}
        >
          <div style={{ fontSize: 24, letterSpacing: '0.2em', color: '#4A5568' }}>
            CERTIFICATE OF COMPLETION
          </div>
          <div style={{ fontSize: 72, fontWeight: 'bold', color: '#FF5722', marginTop: '40px' }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 36, marginTop: '20px', color: '#2D3748' }}>
            has successfully completed the
          </div>
          <div style={{ fontSize: 48, fontWeight: 'bold', marginTop: '10px', color: '#2D3748' }}>
            45-Day Fitness Challenge
          </div>
          <div style={{ fontSize: 24, marginTop: '10px', color: '#4A5568' }}>
            ({profile.workout_routine} Routine)
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [{ name: 'Inter', data: fontData, style: 'normal' }],
      }
    );
  } catch (e: any) {
    console.error(`Failed to generate OG image for user ${userId}:`, e.message);
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}