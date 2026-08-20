'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import DemoFrame from './DemoFrame'
import { PauseIcon, PlayIcon, ResetIcon } from '@/components/icons'
import { useAnimationLoop, useOnScreen, usePrefersReducedMotion } from '@/lib/hooks'
import {
  createSim,
  OCCLUDER,
  projectHud,
  step,
  WORLD_H,
  WORLD_W,
  type Hud,
  type Sim,
} from '@/lib/demos/tracking-sim'

function hsl(hue: number, saturation: number, lightness: number, alpha = 1) {
  return `hsla(${hue.toFixed(0)}, ${saturation}%, ${lightness}%, ${alpha})`
}

/**
 * Renders the tracker state. The canvas is intentionally dark in both themes:
 * these overlays represent video footage, and a light background would misread.
 */
function draw(
  ctx: CanvasRenderingContext2D,
  sim: Sim,
  width: number,
  height: number,
  showTrails: boolean
) {
  const scaleX = width / WORLD_W
  const scaleY = height / WORLD_H

  ctx.clearRect(0, 0, width, height)

  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#0d1520')
  gradient.addColorStop(1, '#080b0f')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)'
  ctx.lineWidth = 1
  for (let x = 0; x < WORLD_W; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x * scaleX, 0)
    ctx.lineTo(x * scaleX, height)
    ctx.stroke()
  }
  for (let y = 0; y < WORLD_H; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y * scaleY)
    ctx.lineTo(width, y * scaleY)
    ctx.stroke()
  }

  // Occlusion band.
  ctx.fillStyle = 'rgba(244, 63, 94, 0.10)'
  ctx.fillRect(OCCLUDER.x * scaleX, 0, OCCLUDER.w * scaleX, height)
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)'
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.moveTo(OCCLUDER.x * scaleX, 0)
  ctx.lineTo(OCCLUDER.x * scaleX, height)
  ctx.moveTo((OCCLUDER.x + OCCLUDER.w) * scaleX, 0)
  ctx.lineTo((OCCLUDER.x + OCCLUDER.w) * scaleX, height)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = 'rgba(244, 63, 94, 0.75)'
  ctx.font = '10px ui-monospace, monospace'
  ctx.fillText('occlusion zone', (OCCLUDER.x + 6) * scaleX, 14)

  // Ground truth, drawn faintly so tracks read as an overlay on top.
  for (const particle of sim.particles) {
    ctx.beginPath()
    ctx.arc(particle.x * scaleX, particle.y * scaleY, particle.r * scaleX, 0, Math.PI * 2)
    ctx.fillStyle = hsl(particle.hue, 45, 62, 0.5)
    ctx.fill()
  }

  if (showTrails) {
    for (const track of sim.tracks) {
      if (track.trail.length < 2) continue
      ctx.beginPath()
      track.trail.forEach((point, index) => {
        const px = point.x * scaleX
        const py = point.y * scaleY
        if (index === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      ctx.strokeStyle = hsl(track.hue, 70, 60, 0.32)
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  }

  ctx.font = '9px ui-monospace, monospace'
  for (const track of sim.tracks) {
    const size = Math.max(14, track.r * 3.4) * scaleX
    const x = track.x * scaleX - size / 2
    const y = track.y * scaleY - size / 2

    const isLost = track.state === 'lost'
    const flashing = track.reidFlash > 0

    const color = flashing
      ? 'rgba(167, 139, 250, 0.95)'
      : isLost
        ? 'rgba(251, 191, 36, 0.88)'
        : 'rgba(34, 211, 238, 0.92)'

    ctx.strokeStyle = color
    ctx.lineWidth = flashing ? 2 : 1.2
    if (isLost) ctx.setLineDash([3, 3])
    ctx.strokeRect(x, y, size, size)
    ctx.setLineDash([])

    ctx.fillStyle = color
    ctx.fillText(`${track.id}${isLost ? ' ?' : ''}`, x, y - 3)
    if (flashing) ctx.fillText('re-id', x + size + 3, y + 7)
  }
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

const EMPTY_HUD: Hud = { active: 0, lost: 0, total: 0, reids: 0, fragmentations: 0 }

export default function TrackingDemo() {
  const [containerRef, onScreen] = useOnScreen<HTMLDivElement>()
  const reduced = usePrefersReducedMotion()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const simRef = useRef<Sim>(createSim())
  const throttleRef = useRef(0)
  const sizeRef = useRef({ width: WORLD_W, height: WORLD_H })
  const trailsRef = useRef(true)

  const [paused, setPaused] = useState(false)
  const [showTrails, setShowTrails] = useState(true)
  const [hud, setHud] = useState<Hud>(EMPTY_HUD)
  const [fps, setFps] = useState(0)

  trailsRef.current = showTrails
  const running = onScreen && !paused && !reduced

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    const { width, height } = sizeRef.current
    draw(ctx, simRef.current, width, height, trailsRef.current)
  }, [])

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = parent.clientWidth
    if (width === 0) return
    const height = Math.round((width * WORLD_H) / WORLD_W)

    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    sizeRef.current = { width, height }
    render()
  }, [render])

  useEffect(() => {
    resize()

    const parent = canvasRef.current?.parentElement
    if (typeof ResizeObserver === 'undefined' || !parent) {
      window.addEventListener('resize', resize)
      return () => window.removeEventListener('resize', resize)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [resize])

  // Repaint immediately when the trails toggle changes, even while paused.
  useEffect(() => {
    render()
  }, [showTrails, render])

  useAnimationLoop((delta) => {
    step(simRef.current, delta)
    render()

    throttleRef.current += delta
    if (throttleRef.current >= 120) {
      throttleRef.current = 0
      setHud(projectHud(simRef.current))
      setFps(delta > 0 ? 1000 / delta : 0)
    }
  }, running)

  // Reduced motion: advance to a settled state and paint one static frame.
  useEffect(() => {
    if (!reduced) return
    const sim = createSim()
    for (let i = 0; i < 600; i += 1) step(sim, 16)
    simRef.current = sim
    setHud(projectHud(sim))
    setFps(0)
    render()
  }, [reduced, render])

  const reset = useCallback(() => {
    simRef.current = createSim()
    throttleRef.current = 0
    setHud(EMPTY_HUD)
    setFps(0)
    render()
  }, [render])

  return (
    <div ref={containerRef}>
      <DemoFrame
        title="Multi-Object Tracking"
        subtitle="Particles cross a band where the detector cannot see them. Watch tracks go dashed, keep predicting, then recover their original identity on the far side."
        kind="simulation"
        note="Simulation. Particle motion is generated in the browser to demonstrate association and re-identification. The tracker uses gated greedy matching, an appearance check, and motion prediction through occlusion. This is not research footage."
        controls={
          <>
            <button
              type="button"
              onClick={() => setShowTrails((value) => !value)}
              className="btn-ghost !px-3 !py-2 !text-xs"
            >
              {showTrails ? 'Hide trails' : 'Show trails'}
            </button>
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              className="btn-ghost !px-3 !py-2 !text-xs"
            >
              {paused ? <PlayIcon className="h-3 w-3" /> : <PauseIcon className="h-3 w-3" />}
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button type="button" onClick={reset} className="btn-ghost !px-3 !py-2 !text-xs">
              <ResetIcon className="h-3.5 w-3.5" />
              Reset
            </button>
          </>
        }
        footer={
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">Reported project result: 3,500+ entities</span>
            <span className="chip">Reported result: 0.82 mAP</span>
            <span className="chip">YOLOv8 detection</span>
            <span className="chip">FairMOT re-identification</span>
          </div>
        }
      >
        <div className="overflow-hidden rounded-lg border border-ink-200 dark:border-ink-800">
          <canvas ref={canvasRef} className="block w-full" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <Stat label="Active tracks" value={String(hud.active)} hint="detector confirmed" />
            <Stat label="Predicting" value={String(hud.lost)} hint="inside occlusion" />
            <Stat label="Re-identified" value={String(hud.reids)} hint="identity recovered" />
            <Stat label="Tracks created" value={String(hud.total)} hint="cumulative" />
            <Stat label="Fragmentations" value={String(hud.fragmentations)} hint="identity lost" />
            <Stat
              label="Render"
              value={fps > 0 ? `${fps.toFixed(0)} fps` : 'static'}
              hint="browser canvas"
            />
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-ink-200 p-3 dark:border-ink-800">
              <p className="label-mono mb-2.5">Analysis cycle time</p>
              {[
                { label: 'Manual annotation', hours: 40, tone: 'bg-ink-400 dark:bg-ink-600' },
                { label: 'This pipeline', hours: 2, tone: 'bg-accent-500' },
              ].map((row) => (
                <div key={row.label} className="mb-2.5 last:mb-0">
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-ink-600 dark:text-ink-400">{row.label}</span>
                    <span className="font-mono tabular-nums text-ink-800 dark:text-ink-200">
                      {row.hours}h
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                    <div
                      className={`h-full rounded-full ${row.tone}`}
                      style={{ width: `${(row.hours / 40) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="mt-2 text-[11px] text-ink-500 dark:text-ink-400">
                95% reduction per experimental cycle.
              </p>
            </div>

            <ul className="space-y-1.5 rounded-lg border border-ink-200 p-3 text-[11px] dark:border-ink-800">
              {[
                { color: 'bg-accent-400', label: 'Solid box: detector confirmed this frame' },
                { color: 'bg-amber-400', label: 'Dashed box: occluded, motion predicted' },
                { color: 'bg-violet-400', label: 'Violet flash: identity re-associated' },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-sm ${item.color}`} />
                  <span className="text-ink-600 dark:text-ink-400">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DemoFrame>
    </div>
  )
}
