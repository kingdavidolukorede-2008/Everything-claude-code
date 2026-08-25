const RING_TEXT = 'OPEN 24 HOURS ✦ '.repeat(4)

export function DialSVG() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="dial-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E3C878" />
            <stop offset="100%" stopColor="#C9A24B" />
          </linearGradient>
          <linearGradient id="dial-wine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3A1E2B" />
            <stop offset="100%" stopColor="#170B0E" />
          </linearGradient>
          <path id="dial-ring-path" d="M200,40 a160,160 0 1,1 -0.1,0" fill="none" />
        </defs>

        {/* outer hairline */}
        <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(244,232,216,0.12)" strokeWidth="1" />

        {/* rotating gold ring with ticker text */}
        <g className="origin-center motion-safe:animate-[spin_34s_linear_infinite]" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <circle cx="200" cy="200" r="160" fill="none" stroke="#C9A24B" strokeOpacity="0.35" strokeWidth="1" />
          <text fill="#C9A24B" fontSize="13" letterSpacing="3" fontFamily="'IBM Plex Mono', monospace">
            <textPath href="#dial-ring-path" startOffset="0%">
              {RING_TEXT}
            </textPath>
          </text>
        </g>

        {/* tick marks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2 - Math.PI / 2
          const r1 = 122
          const r2 = i % 6 === 0 ? 110 : 116
          const x1 = 200 + Math.cos(angle) * r1
          const y1 = 200 + Math.sin(angle) * r1
          const x2 = 200 + Math.cos(angle) * r2
          const y2 = 200 + Math.sin(angle) * r2
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#8E7B72"
              strokeOpacity={i % 6 === 0 ? 0.7 : 0.35}
              strokeWidth={i % 6 === 0 ? 1.6 : 1}
            />
          )
        })}

        {/* sun / moon core — gold half + wine half */}
        <circle cx="200" cy="200" r="96" fill="url(#dial-wine)" stroke="rgba(244,232,216,0.12)" strokeWidth="1" />
        <path d="M200,104 a96,96 0 0 1 0,192 Z" fill="url(#dial-gold)" opacity="0.9" />
        <circle cx="200" cy="200" r="96" fill="none" stroke="#C9A24B" strokeOpacity="0.5" strokeWidth="1" />

        {/* moon crescent on wine half */}
        <path
          d="M172,168 a34,34 0 1 0 6,54 a26,26 0 1 1 -6,-54 Z"
          fill="#F4E8D8"
          opacity="0.85"
        />

        {/* sun rays on gold half */}
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = -70 + i * 22
          const rad = (angle * Math.PI) / 180
          const cx = 236
          const cy = 200
          const x1 = cx + Math.cos(rad) * 20
          const y1 = cy + Math.sin(rad) * 20
          const x2 = cx + Math.cos(rad) * 30
          const y2 = cy + Math.sin(rad) * 30
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#170B0E"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.55"
            />
          )
        })}
        <circle cx="236" cy="200" r="15" fill="#170B0E" opacity="0.15" />

        {/* center label */}
        <text
          x="200"
          y="196"
          textAnchor="middle"
          fill="#F4E8D8"
          fontSize="15"
          fontFamily="'IBM Plex Mono', monospace"
          letterSpacing="2"
        >
          24H
        </text>
        <text
          x="200"
          y="214"
          textAnchor="middle"
          fill="#C9B9A6"
          fontSize="9"
          fontFamily="'IBM Plex Mono', monospace"
          letterSpacing="1.5"
        >
          LEKKI, LAGOS
        </text>
      </svg>
    </div>
  )
}
