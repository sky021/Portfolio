'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import DemoFrame from './DemoFrame'
import { PauseIcon, PlayIcon, ResetIcon } from '@/components/icons'
import { useAnimationLoop, useOnScreen, usePrefersReducedMotion } from '@/lib/hooks'
import {
  createSim,
  frameNoise,
  MAX_WORKERS,
  PROFILES,
  project,
  step,
  type Detection,
  type Profile,
  type Sim,
  type View,
} from '@/lib/demos/lambdalens-sim'

/** Synthetic frame preview with detection overlays derived from the frame id. */
function FramePreview({ detection }: { detection: Detection | null }) {
  const frameId = detection?.frameId ?? 0
  const boxCount = 1 + Math.floor(frameNoise(frameId, 11) * 3)

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-ink-900">
      <svg viewBox="0 0 160 90" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="lambdaFrameBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1e293b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <rect width="160" height="90" fill="url(#lambdaFrameBg)" />

        {/* Abstract scene content so the panel reads as a video frame. */}
        {Array.from({ length: 5 }).map((_, index) => {
          const seed = frameNoise(frameId, index + 20)
          return (
            <circle
              key={index}
              cx={12 + seed * 136}
              cy={16 + frameNoise(frameId, index + 40) * 60}
              r={6 + seed * 14}
              fill="#334155"
              opacity={0.55}
            />
          )
        })}

        {Array.from({ length: boxCount }).map((_, index) => {
          const x = 14 + frameNoise(frameId, index + 60) * 100
          const y = 12 + frameNoise(frameId, index + 80) * 46
          const w = 22 + frameNoise(frameId, index + 100) * 16
          const h = w * 1.15
          const confidence = 0.84 + frameNoise(frameId, index + 120) * 0.15
          return (
            <g key={index}>
              <rect x={x} y={y} width={w} height={h} fill="none" stroke="#22d3ee" strokeWidth={1} />
              <rect x={x} y={Math.max(0, y - 7)} width={30} height={7} fill="#22d3ee" />
              <text x={x + 1.5} y={Math.max(5.2, y - 1.6)} fontSize={4.6} fill="#083344">
                face {confidence.toFixed(2)}
              </text>
            </g>
          )
        })}
      </svg>

      <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-accent-300">
        frame {frameId || 'N/A'}
      </span>
    </div>
  )
}

const EDGE_PATHS = {
  uploadToS3: 'M 104 120 L 138 120',
  s3ToSqs: 'M 236 120 L 270 120',
  sqsToPool: 'M 368 120 L 402 120',
  poolToModel: 'M 528 96 C 552 96, 552 62, 576 62',
  poolToStore: 'M 528 120 L 576 120',
  poolToLogs: 'M 528 144 C 552 144, 552 178, 576 178',
}

function Topology({ view }: { view: View }) {
  const reduced = usePrefersReducedMotion()
  const queueFill = Math.min(1, view.queueDepth / 24)

  return (
    <svg
      viewBox="0 0 700 240"
      className="h-auto w-full"
      style={{ minWidth: 620 }}
      role="img"
      aria-label="Serverless video pipeline topology"
    >
      <g className="stroke-ink-300 dark:stroke-ink-700" strokeWidth={1.5} fill="none">
        {Object.values(EDGE_PATHS).map((path) => (
          <path key={path} d={path} />
        ))}
      </g>

      {!reduced &&
        view.activeWorkers > 0 &&
        [EDGE_PATHS.s3ToSqs, EDGE_PATHS.sqsToPool, EDGE_PATHS.poolToStore].map((path) =>
          [0, 0.45, 0.9].map((delay) => (
            <circle key={`${path}-${delay}`} r={2.6} className="fill-accent-500">
              <animateMotion dur="1.1s" begin={`${delay}s`} repeatCount="indefinite" path={path} />
            </circle>
          ))
        )}

      <g>
        <rect x={14} y={98} width={90} height={44} rx={9} className="fill-white stroke-ink-200 dark:fill-ink-900 dark:stroke-ink-700" strokeWidth={1} />
        <text x={30} y={118} fontSize={12} fontWeight={600} className="fill-ink-900 dark:fill-ink-100">Upload</text>
        <text x={30} y={132} fontSize={9.5} className="fill-ink-500 font-mono dark:fill-ink-400">video</text>
      </g>

      <g>
        <rect x={146} y={98} width={90} height={44} rx={9} className="fill-white stroke-ink-200 dark:fill-ink-900 dark:stroke-ink-700" strokeWidth={1} />
        <rect x={146} y={110} width={3} height={20} rx={1.5} className="fill-emerald-500" />
        <text x={160} y={118} fontSize={12} fontWeight={600} className="fill-ink-900 dark:fill-ink-100">S3</text>
        <text x={160} y={132} fontSize={9.5} className="fill-ink-500 font-mono dark:fill-ink-400">objects</text>
      </g>

      {/* SQS with live queue depth */}
      <g>
        <rect x={278} y={90} width={90} height={60} rx={9} className="fill-white stroke-ink-200 dark:fill-ink-900 dark:stroke-ink-700" strokeWidth={1} />
        <rect x={278} y={104} width={3} height={32} rx={1.5} className="fill-amber-500" />
        <text x={292} y={108} fontSize={12} fontWeight={600} className="fill-ink-900 dark:fill-ink-100">SQS</text>
        <text x={292} y={121} fontSize={9.5} className="fill-ink-500 font-mono dark:fill-ink-400">
          depth {view.queueDepth}
        </text>
        <rect x={292} y={128} width={62} height={5} rx={2.5} className="fill-ink-200 dark:fill-ink-800" />
        <rect x={292} y={128} width={Math.max(1, 62 * queueFill)} height={5} rx={2.5} className="fill-amber-500" />
      </g>

      {/* Lambda worker pool */}
      <g>
        <rect x={402} y={26} width={126} height={188} rx={11} className="fill-white stroke-ink-200 dark:fill-ink-900 dark:stroke-ink-700" strokeWidth={1} />
        <text x={414} y={44} fontSize={12} fontWeight={600} className="fill-ink-900 dark:fill-ink-100">Lambda pool</text>
        <text x={414} y={57} fontSize={9.5} className="fill-ink-500 font-mono dark:fill-ink-400">
          {view.activeWorkers}/{MAX_WORKERS} concurrent
        </text>

        {view.workers.map((worker, index) => {
          const col = index % 2
          const row = Math.floor(index / 2)
          const x = 414 + col * 54
          const y = 68 + row * 34
          const fill =
            worker.state === 'busy'
              ? 'fill-accent-500/20'
              : worker.state === 'cold'
                ? 'fill-amber-500/20'
                : 'fill-ink-100 dark:fill-ink-800/60'
          const stroke =
            worker.state === 'busy'
              ? 'stroke-accent-500'
              : worker.state === 'cold'
                ? 'stroke-amber-500'
                : 'stroke-ink-200 dark:stroke-ink-700'

          return (
            <g key={index}>
              <rect x={x} y={y} width={46} height={26} rx={5} className={`${fill} ${stroke}`} strokeWidth={1} />
              <text x={x + 5} y={y + 11} fontSize={7.5} className="fill-ink-500 font-mono dark:fill-ink-400">
                {worker.state === 'idle' ? 'idle' : worker.state === 'cold' ? 'init' : `f${worker.frameId ?? ''}`}
              </text>
              <rect x={x + 5} y={y + 16} width={36} height={3} rx={1.5} className="fill-ink-200 dark:fill-ink-700" />
              <rect
                x={x + 5}
                y={y + 16}
                width={Math.max(0, 36 * worker.progress)}
                height={3}
                rx={1.5}
                className={worker.state === 'cold' ? 'fill-amber-500' : 'fill-accent-500'}
              />
            </g>
          )
        })}
      </g>

      <g>
        <rect x={576} y={40} width={110} height={44} rx={9} className="fill-white stroke-ink-200 dark:fill-ink-900 dark:stroke-ink-700" strokeWidth={1} />
        <rect x={576} y={52} width={3} height={20} rx={1.5} className="fill-fuchsia-500" />
        <text x={590} y={60} fontSize={11.5} fontWeight={600} className="fill-ink-900 dark:fill-ink-100">ResNet-34</text>
        <text x={590} y={74} fontSize={9.5} className="fill-ink-500 font-mono dark:fill-ink-400">inference</text>
      </g>

      <g>
        <rect x={576} y={98} width={110} height={44} rx={9} className="fill-white stroke-ink-200 dark:fill-ink-900 dark:stroke-ink-700" strokeWidth={1} />
        <rect x={576} y={110} width={3} height={20} rx={1.5} className="fill-emerald-500" />
        <text x={590} y={118} fontSize={11.5} fontWeight={600} className="fill-ink-900 dark:fill-ink-100">MongoDB</text>
        <text x={590} y={132} fontSize={9.5} className="fill-ink-500 font-mono dark:fill-ink-400">
          {view.processed.toLocaleString('en-US')} docs
        </text>
      </g>

      <g>
        <rect x={576} y={156} width={110} height={44} rx={9} className="fill-white stroke-ink-200 dark:fill-ink-900 dark:stroke-ink-700" strokeWidth={1} />
        <rect x={576} y={168} width={3} height={20} rx={1.5} className="fill-rose-500" />
        <text x={590} y={176} fontSize={11.5} fontWeight={600} className="fill-ink-900 dark:fill-ink-100">CloudWatch</text>
        <text x={590} y={190} fontSize={9.5} className="fill-ink-500 font-mono dark:fill-ink-400">traces</text>
      </g>
    </svg>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-ink-200 px-3 py-2.5 dark:border-ink-800">
      <p className="label-mono">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-ink-900 dark:text-ink-50">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-ink-500 dark:text-ink-400">{hint}</p>}
    </div>
  )
}

export default function LambdaLensPipeline() {
  const [containerRef, onScreen] = useOnScreen<HTMLDivElement>()
  const reduced = usePrefersReducedMotion()

  const [profileId, setProfileId] = useState<Profile['id']>('optimized')
  const [paused, setPaused] = useState(false)

  const simRef = useRef<Sim>(createSim())
  const throttleRef = useRef(0)
  const [view, setView] = useState<View>(() => project(createSim()))

  const profile = PROFILES[profileId]
  const running = onScreen && !paused && !reduced

  useAnimationLoop((delta) => {
    step(simRef.current, delta, profile)
    throttleRef.current += delta
    // Repaint at roughly 12Hz; the simulation still advances at full resolution.
    if (throttleRef.current >= 80) {
      throttleRef.current = 0
      setView(project(simRef.current))
    }
  }, running)

  // With reduced motion the loop never runs, so advance to a representative
  // state rather than showing an empty pipeline.
  useEffect(() => {
    if (!reduced) return
    const sim = createSim()
    for (let i = 0; i < 900; i += 1) step(sim, 16, PROFILES[profileId])
    simRef.current = sim
    setView(project(sim))
  }, [reduced, profileId])

  const restart = useCallback(() => {
    simRef.current = createSim()
    throttleRef.current = 0
    setView(project(simRef.current))
  }, [])

  const switchProfile = useCallback(
    (id: Profile['id']) => {
      setProfileId(id)
      restart()
    },
    [restart]
  )

  const relativeCost = profile.relativeCost
  const savedPercent = Math.round((1 - relativeCost) * 100)

  return (
    <div ref={containerRef}>
      <DemoFrame
        title="LambdaLens Pipeline"
        subtitle="Frames arrive faster than any single worker can handle. Watch the queue absorb the burst and concurrency scale to meet it."
        kind="simulation"
        note="Simulation. The topology follows the project architecture documented in the resume. Frames, logs, cold-start timings, and processing timings are illustrative. The relative cost model is calibrated only to the reported 50% cost reduction."
        controls={
          <>
            <div className="flex rounded-lg border border-ink-200 p-0.5 dark:border-ink-800">
              {(['baseline', 'optimized'] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => switchProfile(id)}
                  className={`rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                    profileId === id
                      ? 'bg-accent-500/15 text-accent-700 dark:text-accent-300'
                      : 'text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              className="btn-ghost !px-3 !py-2 !text-xs"
            >
              {paused ? <PlayIcon className="h-3 w-3" /> : <PauseIcon className="h-3 w-3" />}
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button type="button" onClick={restart} className="btn-ghost !px-3 !py-2 !text-xs">
              <ResetIcon className="h-3.5 w-3.5" />
              Reset
            </button>
          </>
        }
        footer={
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{profile.label}</span>
            <span className="chip">illustrative timing model</span>
            <span className="chip">relative cost {profile.relativeCost.toFixed(2)}x</span>
          </div>
        }
      >
        <div className="scrollbar-slim -mx-1 overflow-x-auto px-1">
          <Topology view={view} />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
          <div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Stat label="Processed" value={view.processed.toLocaleString('en-US')} hint="frames" />
              <Stat label="Queue depth" value={String(view.queueDepth)} hint="awaiting a worker" />
              <Stat
                label="Avg latency"
                value={`${(view.avgLatencyMs / 1000).toFixed(2)}s`}
                hint="enqueue to result"
              />
              <Stat label="Cold starts" value={String(view.coldStarts)} hint="container inits" />
            </div>

            <div className="mt-2.5 rounded-lg border border-ink-200 p-3 dark:border-ink-800">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="label-mono">Relative cost index</p>
                <p className="font-mono text-sm font-semibold tabular-nums text-ink-900 dark:text-ink-50">
                  {relativeCost.toFixed(2)}x
                </p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                <div
                  className="h-full rounded-full bg-accent-500 transition-[width] duration-300"
                  style={{
                    width: `${Math.min(100, relativeCost * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-[11px] text-ink-500 dark:text-ink-400">
                {profileId === 'optimized'
                  ? `The optimized profile models the reported ${savedPercent}% cost reduction. This is a relative comparison, not a dollar estimate.`
                  : 'Switch to the optimized profile to compare the reported relative cost reduction.'}
              </p>
            </div>

            <div className="mt-2.5 rounded-lg border border-ink-200 bg-ink-950 p-3 dark:border-ink-800">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                CloudWatch log stream
              </p>
              <div className="scrollbar-slim h-40 overflow-y-auto font-mono text-[11px] leading-relaxed">
                {view.logs.length === 0 && (
                  <p className="text-ink-600">Waiting for the first invocation…</p>
                )}
                {view.logs.map((line) => (
                  <p key={line.id} className="whitespace-nowrap">
                    <span className="text-ink-600">{line.time}</span>{' '}
                    <span className={line.level === 'WARN' ? 'text-amber-400' : 'text-emerald-400'}>
                      {line.level}
                    </span>{' '}
                    <span className="text-ink-300">{line.text}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="label-mono mb-2">Latest inference</p>
            <FramePreview detection={view.detection} />
            <div className="mt-2.5 space-y-1.5 rounded-lg border border-ink-200 p-3 dark:border-ink-800">
              <div className="flex justify-between gap-2 text-[12px]">
                <span className="text-ink-500 dark:text-ink-400">Label</span>
                <span className="font-mono text-ink-800 dark:text-ink-200">
                  {view.detection?.label ?? 'N/A'}
                </span>
              </div>
              <div className="flex justify-between gap-2 text-[12px]">
                <span className="text-ink-500 dark:text-ink-400">Confidence</span>
                <span className="font-mono tabular-nums text-ink-800 dark:text-ink-200">
                  {view.detection ? view.detection.confidence.toFixed(3) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between gap-2 text-[12px]">
                <span className="text-ink-500 dark:text-ink-400">Model</span>
                <span className="font-mono text-ink-800 dark:text-ink-200">ResNet-34</span>
              </div>
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-ink-500 dark:text-ink-400">
              Detection overlays are drawn from a deterministic function of the frame id, so the
              preview changes per frame without pretending to be real footage.
            </p>
          </div>
        </div>
      </DemoFrame>
    </div>
  )
}
