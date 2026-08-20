import type { DemoKey } from '@/content/work'

/**
 * Small abstract SVG previews shown on the work cards, so each card carries a
 * visual cue for what its demo actually does rather than a generic thumbnail.
 */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg border border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-950/60">
      <svg viewBox="0 0 320 140" className="h-full w-full" aria-hidden="true">
        <g className="stroke-ink-200/60 dark:stroke-ink-800" strokeWidth={1}>
          {[0, 1, 2, 3].map((row) => (
            <line key={row} x1={0} y1={row * 35} x2={320} y2={row * 35} />
          ))}
        </g>
        {children}
      </svg>
    </div>
  )
}

function NL2SQLPreview() {
  return (
    <Frame>
      {/* Question -> retrieval -> generate -> repair loop */}
      <rect x={16} y={22} width={78} height={20} rx={5} className="fill-ink-200/70 dark:fill-ink-800" />
      <text x={24} y={36} fontSize={9} className="fill-ink-600 font-mono dark:fill-ink-300">
        &quot;top regions?&quot;
      </text>

      {[0, 1, 2].map((index) => (
        <rect
          key={index}
          x={118}
          y={16 + index * 14}
          width={54}
          height={10}
          rx={3}
          className={index < 2 ? 'fill-accent-500/70' : 'fill-ink-200 dark:fill-ink-800'}
        />
      ))}

      <path d="M96 32 L114 32" className="stroke-ink-300 dark:stroke-ink-700" strokeWidth={1.2} />
      <path d="M176 32 L196 32" className="stroke-ink-300 dark:stroke-ink-700" strokeWidth={1.2} />

      <rect x={198} y={18} width={104} height={44} rx={6} className="fill-white stroke-ink-200 dark:fill-ink-900 dark:stroke-ink-700" strokeWidth={1} />
      <text x={206} y={32} fontSize={8} className="fill-violet-500 font-mono">SELECT region,</text>
      <text x={206} y={43} fontSize={8} className="fill-ink-500 font-mono dark:fill-ink-400">SUM(amount)</text>
      <text x={206} y={54} fontSize={8} className="fill-violet-500 font-mono">GROUP BY 1</text>

      {/* Repair loop */}
      <path
        d="M250 66 C250 86, 150 86, 150 70"
        className="stroke-amber-500 animate-flow"
        strokeWidth={1.4}
        strokeDasharray="4 4"
        fill="none"
      />
      <text x={166} y={98} fontSize={8} className="fill-amber-600 font-mono dark:fill-amber-400">
        retry on error
      </text>

      {/* Result rows */}
      {[0, 1, 2].map((index) => (
        <g key={index}>
          <rect x={16} y={78 + index * 15} width={120} height={10} rx={2} className="fill-ink-200/80 dark:fill-ink-800" />
          <rect x={140} y={78 + index * 15} width={30 - index * 7} height={10} rx={2} className="fill-emerald-500/60" />
        </g>
      ))}
    </Frame>
  )
}

function LambdaLensPreview() {
  return (
    <Frame>
      <rect x={14} y={58} width={44} height={24} rx={5} className="fill-white stroke-ink-200 dark:fill-ink-900 dark:stroke-ink-700" strokeWidth={1} />
      <text x={22} y={73} fontSize={8} className="fill-ink-600 font-mono dark:fill-ink-300">S3</text>

      <rect x={78} y={58} width={44} height={24} rx={5} className="fill-white stroke-amber-500/60 dark:fill-ink-900" strokeWidth={1} />
      <text x={84} y={73} fontSize={8} className="fill-amber-600 font-mono dark:fill-amber-400">SQS</text>

      <path d="M58 70 L76 70" className="stroke-ink-300 dark:stroke-ink-700" strokeWidth={1.2} />

      {/* Fan out to workers */}
      {[0, 1, 2, 3].map((index) => (
        <g key={index}>
          <path
            d={`M122 70 C150 70, 150 ${22 + index * 32}, 174 ${22 + index * 32}`}
            className="stroke-accent-500/60 animate-flow"
            strokeWidth={1.2}
            strokeDasharray="3 6"
            fill="none"
            style={{ animationDelay: `${index * 200}ms` }}
          />
          <rect
            x={176}
            y={14 + index * 32}
            width={40}
            height={17}
            rx={4}
            className={index < 3 ? 'fill-accent-500/20 stroke-accent-500/70' : 'fill-ink-100 stroke-ink-200 dark:fill-ink-800 dark:stroke-ink-700'}
            strokeWidth={1}
          />
        </g>
      ))}

      <rect x={244} y={44} width={60} height={24} rx={5} className="fill-white stroke-fuchsia-500/50 dark:fill-ink-900" strokeWidth={1} />
      <text x={250} y={59} fontSize={7.5} className="fill-fuchsia-600 font-mono dark:fill-fuchsia-400">ResNet-34</text>

      <rect x={244} y={76} width={60} height={24} rx={5} className="fill-white stroke-emerald-500/50 dark:fill-ink-900" strokeWidth={1} />
      <text x={250} y={91} fontSize={7.5} className="fill-emerald-600 font-mono dark:fill-emerald-400">MongoDB</text>
    </Frame>
  )
}

function TrackingPreview() {
  return (
    <Frame>
      <rect x={132} y={0} width={48} height={140} className="fill-rose-500/10" />
      <line x1={132} y1={0} x2={132} y2={140} className="stroke-rose-500/40" strokeWidth={1} strokeDasharray="4 4" />
      <line x1={180} y1={0} x2={180} y2={140} className="stroke-rose-500/40" strokeWidth={1} strokeDasharray="4 4" />

      {[
        { x: 40, y: 34, id: '12', lost: false },
        { x: 84, y: 88, id: '27', lost: false },
        { x: 150, y: 56, id: '31', lost: true },
        { x: 214, y: 40, id: '31', lost: false },
        { x: 258, y: 96, id: '08', lost: false },
      ].map((box, index) => (
        <g key={index}>
          <rect
            x={box.x}
            y={box.y}
            width={26}
            height={26}
            fill="none"
            className={box.lost ? 'stroke-amber-500' : 'stroke-accent-400'}
            strokeWidth={1.3}
            strokeDasharray={box.lost ? '3 3' : undefined}
          />
          <text
            x={box.x}
            y={box.y - 3}
            fontSize={7.5}
            className={box.lost ? 'fill-amber-500 font-mono' : 'fill-accent-500 font-mono'}
          >
            {box.id}
          </text>
        </g>
      ))}

      <path
        d="M66 47 C100 60, 120 66, 150 69"
        fill="none"
        className="stroke-accent-400/40"
        strokeWidth={1.2}
      />
      <path
        d="M180 66 C196 58, 204 52, 214 53"
        fill="none"
        className="stroke-violet-400/70 animate-flow"
        strokeWidth={1.4}
        strokeDasharray="3 4"
      />
      <text x={196} y={120} fontSize={8} className="fill-violet-500 font-mono">re-id</text>
    </Frame>
  )
}

function RevocationPreview() {
  return (
    <Frame>
      <rect x={16} y={26} width={110} height={38} rx={6} className="fill-white stroke-ink-200 dark:fill-ink-900 dark:stroke-ink-700" strokeWidth={1} />
      <text x={24} y={42} fontSize={8} className="fill-ink-600 font-mono dark:fill-ink-300">reader</text>
      {[0, 1, 2].map((index) => (
        <rect key={index} x={24} y={48 + index * 5} width={90 - index * 18} height={2.5} rx={1} className="fill-emerald-500/60" />
      ))}

      <rect x={16} y={78} width={110} height={38} rx={6} className="fill-white stroke-rose-500/50 dark:fill-ink-900" strokeWidth={1} />
      <text x={24} y={94} fontSize={8} className="fill-rose-600 font-mono dark:fill-rose-400">bot</text>
      <text x={24} y={106} fontSize={6.5} className="fill-rose-500/80 font-mono">
        k4Jd9x2P+aQ7vLm==
      </text>

      <path d="M130 46 L156 60" className="stroke-ink-300 dark:stroke-ink-700" strokeWidth={1.2} />
      <path d="M130 96 L156 74" className="stroke-rose-500/60" strokeWidth={1.2} strokeDasharray="3 3" />

      <rect x={158} y={50} width={64} height={34} rx={6} className="fill-white stroke-accent-500/60 dark:fill-ink-900" strokeWidth={1} />
      <text x={166} y={64} fontSize={7.5} className="fill-accent-600 font-mono dark:fill-accent-400">gateway</text>
      <text x={166} y={76} fontSize={6.5} className="fill-ink-500 font-mono dark:fill-ink-400">grant?</text>

      <path d="M222 67 L246 67" className="stroke-ink-300 dark:stroke-ink-700" strokeWidth={1.2} />

      <rect x={248} y={50} width={56} height={34} rx={6} className="fill-white stroke-rose-500/50 dark:fill-ink-900" strokeWidth={1} />
      <text x={256} y={64} fontSize={7.5} className="fill-rose-600 font-mono dark:fill-rose-400">KMS</text>
      <text x={256} y={76} fontSize={6.5} className="fill-ink-500 font-mono dark:fill-ink-400">unwrap</text>
    </Frame>
  )
}

const previews: Record<DemoKey, () => React.JSX.Element> = {
  nl2sql: NL2SQLPreview,
  lambdalens: LambdaLensPreview,
  tracking: TrackingPreview,
  revocation: RevocationPreview,
}

export default function WorkPreview({ demo }: { demo: DemoKey }) {
  const Preview = previews[demo]
  return <Preview />
}
