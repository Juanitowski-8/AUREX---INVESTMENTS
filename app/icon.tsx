import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 3,
          background: '#0A0A0B',
          borderRadius: 8,
          padding: 6,
        }}
      >
        <div style={{ width: 5, height: 10, background: '#C9A227', borderRadius: 2 }} />
        <div style={{ width: 5, height: 16, background: '#D4AF37', borderRadius: 2 }} />
        <div style={{ width: 5, height: 22, background: '#E8C547', borderRadius: 2 }} />
        <div style={{ width: 5, height: 28, background: '#F0D878', borderRadius: 2 }} />
      </div>
    ),
    { ...size }
  )
}
