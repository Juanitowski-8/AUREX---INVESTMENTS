import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** Apple touch icon — isotipo Aurex */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 14,
          background: '#0A0A0B',
          borderRadius: 40,
          padding: 28,
        }}
      >
        <div style={{ width: 22, height: 52, background: '#C9A227', borderRadius: 6 }} />
        <div style={{ width: 22, height: 78, background: '#D4AF37', borderRadius: 6 }} />
        <div style={{ width: 22, height: 104, background: '#E8C547', borderRadius: 6 }} />
        <div style={{ width: 22, height: 130, background: '#F0D878', borderRadius: 6 }} />
      </div>
    ),
    { ...size }
  )
}
