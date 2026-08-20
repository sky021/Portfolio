/**
 * Verification harness for the demo logic that runs behind the visuals.
 *
 * Run with a Node build that supports TypeScript type stripping:
 *   node --experimental-strip-types scripts/verify-sims.mts
 *
 * Checks the behaviour the demos actually claim on screen: that the queue
 * absorbs a burst, that concurrency scales, that the optimized container profile
 * really is cheaper and faster, that the tracker recovers identity through
 * occlusion rather than fragmenting, and that the revocation demo's envelope
 * encryption is genuine.
 */

import {
  createSim as createPipeline,
  MAX_WORKERS,
  PROFILES,
  project,
  step as stepPipeline,
  type Profile,
} from '../lib/demos/lambdalens-sim.ts'

import {
  createSim as createTracker,
  isOccluded,
  OCCLUDER,
  projectHud,
  step as stepTracker,
  WORLD_H,
  WORLD_W,
} from '../lib/demos/tracking-sim.ts'

import { createBundle, hasWebCrypto, unwrapAndDecrypt } from '../lib/demos/envelope.ts'

let passed = 0
let failed = 0
const failures: string[] = []

function check(name: string, condition: boolean, detail = '') {
  if (condition) {
    passed += 1
    console.log(`  ok    ${name}`)
    return
  }
  failed += 1
  failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
  console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
}

/** Runs the pipeline for a wall-clock duration at a fixed frame budget. */
function runPipeline(profile: Profile, durationMs: number) {
  const sim = createPipeline()
  let peakQueue = 0
  let peakWorkers = 0

  for (let elapsed = 0; elapsed < durationMs; elapsed += 16) {
    stepPipeline(sim, 16, profile)
    const view = project(sim)
    peakQueue = Math.max(peakQueue, view.queueDepth)
    peakWorkers = Math.max(peakWorkers, view.activeWorkers)
  }

  return { sim, view: project(sim), peakQueue, peakWorkers }
}

console.log('\n== lambdalens: pipeline behaviour ==')
{
  const optimized = runPipeline(PROFILES.optimized, 30000)
  const baseline = runPipeline(PROFILES.baseline, 30000)

  check('frames are processed', optimized.view.processed > 0, `${optimized.view.processed}`)
  check(
    'concurrency scales beyond a single worker',
    optimized.peakWorkers > 1,
    `peak ${optimized.peakWorkers}`
  )
  check(
    'concurrency never exceeds the pool size',
    optimized.peakWorkers <= MAX_WORKERS,
    `peak ${optimized.peakWorkers} vs max ${MAX_WORKERS}`
  )
  check('a queue actually forms', optimized.peakQueue > 0, `peak ${optimized.peakQueue}`)
  check(
    'queue stays bounded',
    optimized.view.queueDepth <= 40,
    `${optimized.view.queueDepth}`
  )
  check('cold starts occur and are counted', optimized.view.coldStarts > 0, `${optimized.view.coldStarts}`)
  check(
    'cold starts are bounded by frames processed plus in-flight work',
    optimized.view.coldStarts <= optimized.view.processed + MAX_WORKERS
  )

  check(
    'optimized profile processes more frames than baseline',
    optimized.view.processed > baseline.view.processed,
    `${optimized.view.processed} vs ${baseline.view.processed}`
  )

  const optimizedSpend = (optimized.view.processed / 1000) * PROFILES.optimized.relativeCost
  const baselineEquivalent = (optimized.view.processed / 1000) * PROFILES.baseline.relativeCost
  check(
    'optimized profile halves cost for the same frame count',
    Math.abs(optimizedSpend / baselineEquivalent - 0.5) < 0.001,
    `ratio ${(optimizedSpend / baselineEquivalent).toFixed(3)}`
  )

  check(
    'average latency is positive and finite',
    optimized.view.avgLatencyMs > 0 && Number.isFinite(optimized.view.avgLatencyMs),
    `${optimized.view.avgLatencyMs.toFixed(0)}ms`
  )
  check(
    'baseline latency is worse than optimized',
    baseline.view.avgLatencyMs > optimized.view.avgLatencyMs,
    `${baseline.view.avgLatencyMs.toFixed(0)}ms vs ${optimized.view.avgLatencyMs.toFixed(0)}ms`
  )

  check('log stream is populated', optimized.view.logs.length > 0)
  check('log stream is capped for the view', optimized.view.logs.length <= 14)
  check(
    'log lines are well formed',
    optimized.view.logs.every(
      (line) => /^00:\d{2}:\d{2}\.\d{3}$/.test(line.time) && /frame=\d+ label=\S+ conf=\d\.\d{2} dur=\d+ms/.test(line.text)
    )
  )
  check('a detection is reported', optimized.view.detection !== null)
  check(
    'detection confidence is in range',
    optimized.view.detection !== null &&
      optimized.view.detection.confidence > 0.85 &&
      optimized.view.detection.confidence < 1
  )

  // The enqueue-timestamp map must not grow unboundedly over a long session.
  const long = runPipeline(PROFILES.baseline, 120000)
  check(
    'pending-arrival bookkeeping stays bounded over a long run',
    long.sim.frameEnqueuedAt.size <= 40 + MAX_WORKERS,
    `${long.sim.frameEnqueuedAt.size} entries`
  )

  check(
    'worker progress stays within 0..1',
    long.view.workers.every((worker) => worker.progress >= 0 && worker.progress <= 1)
  )
  check(
    'idle workers hold no frame',
    long.view.workers.every((worker) => worker.state !== 'idle' || worker.frameId === null)
  )
}

console.log('\n== tracking: association and re-identification ==')
{
  const sim = createTracker()

  check('particles are seeded', sim.particles.length === 54, `${sim.particles.length}`)
  check(
    'particles start inside the world bounds',
    sim.particles.every(
      (particle) =>
        particle.x >= 0 && particle.x <= WORLD_W && particle.y >= 0 && particle.y <= WORLD_H
    )
  )

  // First frame should create tracks for every visible particle.
  stepTracker(sim, 16)
  const visibleFirstFrame = sim.particles.filter((particle) => !isOccluded(particle.x)).length
  check(
    'first frame creates one track per visible detection',
    sim.tracks.length === visibleFirstFrame,
    `${sim.tracks.length} tracks vs ${visibleFirstFrame} visible`
  )
  check('occluded particles produce no track initially', sim.tracks.length < sim.particles.length)

  let peakLost = 0
  for (let frame = 0; frame < 1800; frame += 1) {
    stepTracker(sim, 16)
    peakLost = Math.max(peakLost, sim.tracks.filter((track) => track.state === 'lost').length)
  }

  const hud = projectHud(sim)

  check('tracks enter the lost state during occlusion', peakLost > 0, `peak ${peakLost}`)
  check('re-identification happens', hud.reids > 0, `${hud.reids} events`)
  check(
    'identities stay bounded — tracks are reused, not endlessly recreated',
    hud.total < sim.particles.length * 12,
    `${hud.total} created for ${sim.particles.length} particles over 1800 frames`
  )
  check(
    're-identification outnumbers fragmentation',
    hud.reids > hud.fragmentations,
    `${hud.reids} re-ids vs ${hud.fragmentations} fragmentations`
  )
  check(
    'active plus lost equals the live track count',
    hud.active + hud.lost === sim.tracks.length
  )
  check(
    'no track exceeds its trail budget',
    sim.tracks.every((track) => track.trail.length <= 26)
  )
  check(
    'particles remain inside the world after long simulation',
    sim.particles.every(
      (particle) =>
        particle.x >= 0 && particle.x <= WORLD_W && particle.y >= 0 && particle.y <= WORLD_H
    )
  )
  check(
    'every active track sits outside the occlusion band',
    sim.tracks
      .filter((track) => track.state === 'active')
      .every((track) => !isOccluded(track.x)),
    'an active track should have had a detection this frame'
  )
  check(
    'track ids are unique',
    new Set(sim.tracks.map((track) => track.id)).size === sim.tracks.length
  )
  check(
    'occluder sits inside the world',
    OCCLUDER.x > 0 && OCCLUDER.x + OCCLUDER.w < WORLD_W
  )

  // Determinism: the same seed must produce the same outcome.
  const a = createTracker()
  const b = createTracker()
  for (let frame = 0; frame < 300; frame += 1) {
    stepTracker(a, 16)
    stepTracker(b, 16)
  }
  const hudA = projectHud(a)
  const hudB = projectHud(b)
  check(
    'simulation is deterministic for a fixed seed',
    JSON.stringify(hudA) === JSON.stringify(hudB),
    `${JSON.stringify(hudA)} vs ${JSON.stringify(hudB)}`
  )

  // A large frame delta must not tunnel particles out of the world.
  const jumpy = createTracker()
  for (let frame = 0; frame < 200; frame += 1) stepTracker(jumpy, 5000)
  check(
    'a huge frame delta is clamped and does not break bounds',
    jumpy.particles.every(
      (particle) =>
        particle.x >= 0 && particle.x <= WORLD_W && particle.y >= 0 && particle.y <= WORLD_H
    )
  )
}

console.log('\n== revocation: envelope encryption ==')
{
  check('runtime provides Web Crypto', hasWebCrypto())

  const plaintext = 'Regional grid operators trial adaptive load balancing\n\nBody text.'
  const bundle = await createBundle(plaintext)

  check('content is actually encrypted', bundle.ciphertext.byteLength > 0)
  check(
    'ciphertext does not contain the plaintext',
    !new TextDecoder().decode(bundle.ciphertext).includes('Regional grid')
  )
  check(
    'AES-GCM adds an authentication tag',
    bundle.ciphertext.byteLength > new TextEncoder().encode(plaintext).length,
    `${bundle.ciphertext.byteLength} vs ${new TextEncoder().encode(plaintext).length}`
  )
  check('the data key is wrapped, not stored raw', bundle.wrappedKey.byteLength > 32)
  check('the master key is non-extractable', bundle.masterKey.extractable === false)
  check('ciphertext is renderable as base64', /^[A-Za-z0-9+/]+={0,2}$/.test(bundle.ciphertextB64))

  const recovered = await unwrapAndDecrypt(bundle)
  check('a granted read recovers the exact plaintext', recovered === plaintext)

  // The master key cannot be exported, which is what makes the demo's claim
  // honest: a revoked caller has no path to the data key.
  let exportRefused = false
  try {
    await crypto.subtle.exportKey('raw', bundle.masterKey)
  } catch {
    exportRefused = true
  }
  check('the master key refuses export', exportRefused)

  // Tampering must be detected rather than silently returning garbage.
  const tampered = new Uint8Array(bundle.ciphertext.slice(0))
  tampered[0] ^= 0xff
  let tamperRejected = false
  try {
    await unwrapAndDecrypt({ ...bundle, ciphertext: tampered.buffer })
  } catch {
    tamperRejected = true
  }
  check('tampered ciphertext fails authentication', tamperRejected)

  // Two bundles of the same article must not produce identical ciphertext.
  const second = await createBundle(plaintext)
  check(
    'each bundle uses a fresh key and nonce',
    second.ciphertextB64 !== bundle.ciphertextB64
  )
}

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.log('\nFailures:')
  for (const failure of failures) console.log(`  - ${failure}`)
  process.exitCode = 1
}
