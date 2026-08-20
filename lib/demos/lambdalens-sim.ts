/**
 * Discrete-event simulation behind the LambdaLens visualizer.
 *
 * Kept separate from the React component so the queueing and scaling behaviour
 * can be exercised and verified without a DOM.
 *
 * Model: frames arrive at a fixed rate into a queue. A bounded worker pool pulls
 * from the queue; a worker that has been idle longer than the warm window pays a
 * cold-start penalty before processing. Cost accrues per processed frame from the
 * container profile, which is where the real project's saving came from.
 */

export type Profile = {
  id: 'baseline' | 'optimized'
  label: string
  /** Illustrative timing input, not a measured production benchmark. */
  coldStartMs: number
  /** Illustrative timing input, not a measured production benchmark. */
  processMs: number
  /** Relative cost index calibrated to the reported 50% reduction. */
  relativeCost: number
}

export const PROFILES: Record<Profile['id'], Profile> = {
  baseline: {
    id: 'baseline',
    label: 'Before container tuning',
    coldStartMs: 2600,
    processMs: 520,
    relativeCost: 1,
  },
  optimized: {
    id: 'optimized',
    label: 'After container tuning',
    coldStartMs: 900,
    processMs: 430,
    relativeCost: 0.5,
  },
}

export const MAX_WORKERS = 8
export const ARRIVAL_PER_SEC = 7.5
const WARM_IDLE_MS = 4200
const MAX_QUEUE = 40
const MAX_LOGS = 60

export type WorkerState = 'idle' | 'cold' | 'busy'

type Worker = {
  state: WorkerState
  remainingMs: number
  totalMs: number
  warmUntilMs: number
  frameId: number | null
}

export type LogLine = {
  id: number
  time: string
  level: 'INFO' | 'WARN'
  text: string
}

export type Detection = {
  frameId: number
  confidence: number
  label: string
}

export type Sim = {
  clockMs: number
  arrivalCarry: number
  nextFrameId: number
  queue: number[]
  workers: Worker[]
  processed: number
  coldStarts: number
  latencySumMs: number
  logs: LogLine[]
  nextLogId: number
  lastDetection: Detection | null
  frameEnqueuedAt: Map<number, number>
}

export function createSim(): Sim {
  return {
    clockMs: 0,
    arrivalCarry: 0,
    nextFrameId: 1001,
    queue: [],
    workers: Array.from({ length: MAX_WORKERS }, () => ({
      state: 'idle' as WorkerState,
      remainingMs: 0,
      totalMs: 0,
      warmUntilMs: 0,
      frameId: null,
    })),
    processed: 0,
    coldStarts: 0,
    latencySumMs: 0,
    logs: [],
    nextLogId: 1,
    lastDetection: null,
    frameEnqueuedAt: new Map(),
  }
}

/** Deterministic pseudo-random value in [0,1) derived from a frame id. */
export function frameNoise(frameId: number, salt: number): number {
  const x = Math.sin(frameId * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const DETECTION_LABELS = ['face', 'face', 'scene-cut', 'face', 'logo']

export function formatClock(ms: number): string {
  const total = Math.floor(ms)
  const seconds = Math.floor(total / 1000) % 60
  const minutes = Math.floor(total / 60000) % 60
  const millis = total % 1000
  return `00:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
}

export function step(sim: Sim, deltaMs: number, profile: Profile) {
  sim.clockMs += deltaMs

  // Arrivals: upload -> S3 -> SQS.
  sim.arrivalCarry += (deltaMs / 1000) * ARRIVAL_PER_SEC
  while (sim.arrivalCarry >= 1) {
    sim.arrivalCarry -= 1
    const frameId = sim.nextFrameId
    sim.nextFrameId += 1
    sim.queue.push(frameId)
    sim.frameEnqueuedAt.set(frameId, sim.clockMs)
  }

  // Advance in-flight work.
  for (const worker of sim.workers) {
    if (worker.state === 'idle') continue

    worker.remainingMs -= deltaMs
    if (worker.remainingMs > 0) {
      // A cold worker becomes "busy" once past its initialization phase.
      if (worker.state === 'cold' && worker.totalMs - worker.remainingMs >= profile.coldStartMs) {
        worker.state = 'busy'
      }
      continue
    }

    const frameId = worker.frameId
    if (frameId !== null) {
      sim.processed += 1

      const enqueuedAt = sim.frameEnqueuedAt.get(frameId)
      if (enqueuedAt !== undefined) {
        sim.latencySumMs += sim.clockMs - enqueuedAt
        sim.frameEnqueuedAt.delete(frameId)
      }

      const confidence = 0.86 + frameNoise(frameId, 3) * 0.13
      const label = DETECTION_LABELS[frameId % DETECTION_LABELS.length]
      sim.lastDetection = { frameId, confidence, label }

      sim.logs.push({
        id: sim.nextLogId,
        time: formatClock(sim.clockMs),
        level: confidence < 0.9 ? 'WARN' : 'INFO',
        text: `frame=${frameId} label=${label} conf=${confidence.toFixed(2)} dur=${Math.round(worker.totalMs)}ms`,
      })
      sim.nextLogId += 1
      if (sim.logs.length > MAX_LOGS) sim.logs.splice(0, sim.logs.length - MAX_LOGS)
    }

    worker.state = 'idle'
    worker.frameId = null
    worker.remainingMs = 0
    worker.warmUntilMs = sim.clockMs + WARM_IDLE_MS
  }

  // Dispatch from the queue to whatever capacity is free.
  for (const worker of sim.workers) {
    if (sim.queue.length === 0) break
    if (worker.state !== 'idle') continue

    const frameId = sim.queue.shift()
    if (frameId === undefined) break

    const isWarm = sim.clockMs < worker.warmUntilMs
    const jitter = 0.9 + frameNoise(frameId, 7) * 0.25
    if (!isWarm) sim.coldStarts += 1

    worker.totalMs = (isWarm ? 0 : profile.coldStartMs) + profile.processMs * jitter
    worker.remainingMs = worker.totalMs
    worker.state = isWarm ? 'busy' : 'cold'
    worker.frameId = frameId
  }

  // Bound the backlog so a long session stays legible, and drop the arrival
  // timestamps for anything shed so the map cannot grow without limit.
  if (sim.queue.length > MAX_QUEUE) {
    const shed = sim.queue.splice(0, sim.queue.length - MAX_QUEUE)
    for (const frameId of shed) sim.frameEnqueuedAt.delete(frameId)
  }
}

export type View = {
  clockMs: number
  queueDepth: number
  workers: { state: WorkerState; progress: number; frameId: number | null }[]
  activeWorkers: number
  processed: number
  coldStarts: number
  avgLatencyMs: number
  logs: LogLine[]
  detection: Detection | null
}

export function project(sim: Sim): View {
  return {
    clockMs: sim.clockMs,
    queueDepth: sim.queue.length,
    workers: sim.workers.map((worker) => ({
      state: worker.state,
      progress:
        worker.totalMs > 0
          ? Math.min(1, Math.max(0, (worker.totalMs - worker.remainingMs) / worker.totalMs))
          : 0,
      frameId: worker.frameId,
    })),
    activeWorkers: sim.workers.filter((worker) => worker.state !== 'idle').length,
    processed: sim.processed,
    coldStarts: sim.coldStarts,
    avgLatencyMs: sim.processed > 0 ? sim.latencySumMs / sim.processed : 0,
    logs: sim.logs.slice(-14).reverse(),
    detection: sim.lastDetection,
  }
}
