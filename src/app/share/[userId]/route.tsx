// app/share/[userId]/route.tsx

import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const userId = params.userId;

  try {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, workout_routine')
      .eq('id', userId)
      .single();

    if (!profile) {
      return new Response('User not found', { status: 404 });
    }

    // Use Inter font if available or a default
    const font = fetch(
      new URL('../../../assets/Inter-Bold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());
    const fontData = await font;

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
    console.error(e.message);
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}