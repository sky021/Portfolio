/**
 * Tracker simulation behind the multi-object tracking visualizer.
 *
 * Separated from rendering so the association logic can be verified without a
 * canvas. The tracker is genuine: detections are produced per frame, matched to
 * existing tracks by a gated greedy nearest neighbour with an appearance check,
 * and unmatched tracks keep predicting their motion until they can be
 * re-identified or are finally dropped.
 */

export const WORLD_W = 640
export const WORLD_H = 300
export const PARTICLE_COUNT = 54

const GATE_DISTANCE = 34
/** Lost tracks get a wider gate because they have drifted while unobserved. */
const LOST_GATE_MULTIPLIER = 2.4
const HUE_TOLERANCE = 26
const MISS_BEFORE_LOST = 4
/**
 * Maximum frames a track survives without a detection.
 *
 * This is the tracker's max-age parameter and it has to be tuned against how
 * long an object can plausibly stay hidden. At typical particle speeds crossing
 * the occlusion band takes roughly 150 frames, so a threshold below that drops
 * tracks mid-occlusion and fragments identities that were recoverable.
 */
const MISS_BEFORE_DROP = 260
const TRAIL_LENGTH = 26
const REID_FLASH_MS = 620

/** Detections inside this vertical band are suppressed, simulating occlusion. */
export const OCCLUDER = { x: 272, w: 84 }

export type Particle = {
  truthId: number
  x: number
  y: number
  vx: number
  vy: number
  r: number
  /** Stands in for the appearance embedding a re-ID model would supply. */
  hue: number
}

export type Track = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  hue: number
  r: number
  trail: { x: number; y: number }[]
  missed: number
  state: 'active' | 'lost'
  reidFlash: number
  reidCount: number
}

export type Sim = {
  particles: Particle[]
  tracks: Track[]
  nextTrackId: number
  totalTracks: number
  reidEvents: number
  fragmentations: number
  frames: number
}

function makeRng(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

export function createSim(): Sim {
  const rand = makeRng(7761)
  const particles: Particle[] = []

  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    particles.push({
      truthId: index + 1,
      x: 20 + rand() * (WORLD_W - 40),
      y: 20 + rand() * (WORLD_H - 40),
      vx: (rand() - 0.5) * 2.4,
      vy: (rand() - 0.5) * 1.6,
      r: 4 + rand() * 3.5,
      hue: rand() * 360,
    })
  }

  return {
    particles,
    tracks: [],
    nextTrackId: 1,
    totalTracks: 0,
    reidEvents: 0,
    fragmentations: 0,
    frames: 0,
  }
}

function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}

export function isOccluded(x: number): boolean {
  return x > OCCLUDER.x && x < OCCLUDER.x + OCCLUDER.w
}

export function step(sim: Sim, deltaMs: number) {
  const dt = Math.min(deltaMs, 40) / 16.667
  sim.frames += 1

  // Ground truth motion, bouncing off the world bounds.
  for (const particle of sim.particles) {
    particle.x += particle.vx * dt
    particle.y += particle.vy * dt

    if (particle.x < particle.r) {
      particle.x = particle.r
      particle.vx = Math.abs(particle.vx)
    }
    if (particle.x > WORLD_W - particle.r) {
      particle.x = WORLD_W - particle.r
      particle.vx = -Math.abs(particle.vx)
    }
    if (particle.y < particle.r) {
      particle.y = particle.r
      particle.vy = Math.abs(particle.vy)
    }
    if (particle.y > WORLD_H - particle.r) {
      particle.y = WORLD_H - particle.r
      particle.vy = -Math.abs(particle.vy)
    }
  }

  // Detector stage: everything the occluder does not hide.
  const detections = sim.particles
    .filter((particle) => !isOccluded(particle.x))
    .map((particle) => ({
      x: particle.x,
      y: particle.y,
      r: particle.r,
      hue: particle.hue,
    }))

  // Motion prediction for every existing track. Predictions are clamped to the
  // frame, since a tracker has no reason to predict a position it could never
  // observe.
  for (const track of sim.tracks) {
    track.x = Math.min(WORLD_W, Math.max(0, track.x + track.vx * dt))
    track.y = Math.min(WORLD_H, Math.max(0, track.y + track.vy * dt))
    if (track.reidFlash > 0) track.reidFlash -= deltaMs
  }

  // Candidate pairs within the gate and appearance tolerance, cheapest first.
  const pairs: { distance: number; detection: number; track: number }[] = []
  detections.forEach((detection, detectionIndex) => {
    sim.tracks.forEach((track, trackIndex) => {
      if (hueDistance(detection.hue, track.hue) > HUE_TOLERANCE) return
      const distance = Math.hypot(detection.x - track.x, detection.y - track.y)
      const gate = track.state === 'lost' ? GATE_DISTANCE * LOST_GATE_MULTIPLIER : GATE_DISTANCE
      if (distance > gate) return
      pairs.push({ distance, detection: detectionIndex, track: trackIndex })
    })
  })

  pairs.sort((a, b) => a.distance - b.distance)

  const claimedDetections = new Set<number>()
  const claimedTracks = new Set<number>()

  for (const pair of pairs) {
    if (claimedDetections.has(pair.detection) || claimedTracks.has(pair.track)) continue
    claimedDetections.add(pair.detection)
    claimedTracks.add(pair.track)

    const detection = detections[pair.detection]
    const track = sim.tracks[pair.track]

    if (track.state === 'lost') {
      track.state = 'active'
      track.reidFlash = REID_FLASH_MS
      track.reidCount += 1
      sim.reidEvents += 1
    }

    // Smooth the velocity estimate rather than snapping to the frame delta.
    track.vx = track.vx * 0.6 + ((detection.x - track.x) / Math.max(dt, 0.2)) * 0.4
    track.vy = track.vy * 0.6 + ((detection.y - track.y) / Math.max(dt, 0.2)) * 0.4
    track.x = detection.x
    track.y = detection.y
    track.r = detection.r
    track.missed = 0

    track.trail.push({ x: detection.x, y: detection.y })
    if (track.trail.length > TRAIL_LENGTH) track.trail.shift()
  }

  // Unmatched detections start new tracks.
  detections.forEach((detection, index) => {
    if (claimedDetections.has(index)) return
    sim.tracks.push({
      id: sim.nextTrackId,
      x: detection.x,
      y: detection.y,
      vx: 0,
      vy: 0,
      hue: detection.hue,
      r: detection.r,
      trail: [{ x: detection.x, y: detection.y }],
      missed: 0,
      state: 'active',
      reidFlash: 0,
      reidCount: 0,
    })
    sim.nextTrackId += 1
    sim.totalTracks += 1
  })

  // Unmatched tracks age through "lost" before being dropped. A drop that later
  // reappears is a fragmentation, the metric this design exists to keep low.
  for (let index = sim.tracks.length - 1; index >= 0; index -= 1) {
    const track = sim.tracks[index]
    if (claimedTracks.has(index)) continue

    track.missed += 1
    if (track.state === 'active' && track.missed > MISS_BEFORE_LOST) {
      track.state = 'lost'
    }
    if (track.missed > MISS_BEFORE_DROP) {
      sim.fragmentations += 1
      sim.tracks.splice(index, 1)
    }
  }
}

export type Hud = {
  active: number
  lost: number
  total: number
  reids: number
  fragmentations: number
}

export function projectHud(sim: Sim): Hud {
  return {
    active: sim.tracks.filter((track) => track.state === 'active').length,
    lost: sim.tracks.filter((track) => track.state === 'lost').length,
    total: sim.totalTracks,
    reids: sim.reidEvents,
    fragmentations: sim.fragmentations,
  }
}
