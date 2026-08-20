import { ImageResponse } from 'next/og'

/**
 * Social card generated at build time.
 *
 * Generating it means the preview always exists and always matches the current
 * positioning, instead of pointing at a square profile photo cropped to 1200x630.
 */

export const runtime = 'nodejs'
export const alt = 'Akash Agrawal | Software Engineer - AI'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #080b0f 0%, #0f1c26 55%, #083344 100%)',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#67e8f9',
              fontSize: '22px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '9999px',
                background: '#22d3ee',
                display: 'flex',
              }}
            />
            Software Engineer - AI
          </div>

          <div
            style={{
              marginTop: '28px',
              fontSize: '84px',
              fontWeight: 700,
              color: '#f8fafc',
              lineHeight: 1.05,
              display: 'flex',
            }}
          >
            Akash Agrawal
          </div>

          <div
            style={{
              marginTop: '20px',
              fontSize: '32px',
              color: '#94a3b8',
              maxWidth: '860px',
              lineHeight: 1.35,
              display: 'flex',
            }}
          >
            I work backward from customer problems to build reliable AI products, backend services,
            and cloud systems.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          {[
            { value: '95%', label: 'faster analysis' },
            { value: '1,000+', label: 'hours automated / yr' },
            { value: 'Top 2.4%', label: 'ICPC 2019' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '18px 26px',
                borderRadius: '16px',
                border: '1px solid rgba(148,163,184,0.25)',
                background: 'rgba(15,23,42,0.55)',
              }}
            >
              <div style={{ fontSize: '38px', fontWeight: 700, color: '#f8fafc', display: 'flex' }}>
                {item.value}
              </div>
              <div style={{ fontSize: '20px', color: '#94a3b8', display: 'flex' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
