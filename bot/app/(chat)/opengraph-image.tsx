import { ImageResponse } from 'next/og';
import { getConfig } from '@/lib/config/get-config';

export const runtime = 'edge';

const config = getConfig();

export const alt = config.ui.openGraph.alt;
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
          background: config.ui.openGraph.image.gradient,
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
          {config.ui.openGraph.image.title}
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 30,
          }}
        >
          {config.ui.openGraph.image.subtitle}
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
          {config.ui.openGraph.image.tagline}
        </div>
        {config.ui.openGraph.image.footer && (
          <div
            style={{
              fontSize: 24,
              fontWeight: 300,
              marginTop: 40,
              opacity: 0.7,
            }}
          >
            {config.ui.openGraph.image.footer}
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}