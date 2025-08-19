import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Verbier Festival Concierge';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 300,
            letterSpacing: '0.05em',
            marginBottom: 20,
            textTransform: 'uppercase',
          }}
        >
          Verbier Festival
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 30,
          }}
        >
          CONCIERGE
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 400,
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: 1.4,
            opacity: 0.9,
          }}
        >
          Your Personal Classical Music Experience Curator
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 300,
            marginTop: 40,
            opacity: 0.7,
          }}
        >
          Swiss Alps • July 17 - August 3, 2025
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}