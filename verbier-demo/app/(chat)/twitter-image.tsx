import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Verbier Festival Concierge';
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #0C4DA2 0%, #1e3a8a 100%)',
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 300,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              opacity: 0.95,
            }}
          >
            Verbier Festival 2025
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: '-0.01em',
            }}
          >
            CONCIERGE
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              textAlign: 'center',
              marginTop: 20,
              opacity: 0.9,
              maxWidth: '80%',
            }}
          >
            Discover Your Perfect Classical Music Experience
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 300,
              marginTop: 30,
              opacity: 0.7,
            }}
          >
            🎼 200+ Performances • Swiss Alps • July 17 - Aug 3
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}