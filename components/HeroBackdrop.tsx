import { createSim, OCCLUDER, step, WORLD_H, WORLD_W } from '@/lib/demos/tracking-sim'

/**
 * Hero backdrop drawn from the portfolio's particle-tracking simulation.
 *
 * The simulation is advanced here rather than in the browser, so what renders is
 * the output of lib/demos/tracking-sim.ts frozen at a fixed frame. Every trail,
 * box, and identity number was computed by the same simplified association code
 * that the browser demo runs. It is not output from the original YOLOv8/FairMOT
 * research pipeline. The seed makes it identical on every build, and because
 * this is a server component it costs no client JavaScript or image request.
 *
 * The point is that the decoration is derived from the work rather than being
 * generic page furniture.
 */

/** Far enough in that tracks have accumulated trails and crossed the occluder. */
const FRAMES = 320

/**
 * Trails are smooth and drawn faint, so every third point is visually
 * indistinguishable from all of them. Both the subsampling and the integer
 * rounding exist to keep this markup small: it is inlined in the HTML and Next
 * repeats it in the RSC payload, so full precision on every point costs far more
 * than a backdrop should.
 */
function trailPoints(trail: { x: number; y: number }[]): string {
  const points: string[] = []
  for (let index = 0; index < trail.length; index += 3) {
    points.push(`${Math.round(trail[index].x)},${Math.round(trail[index].y)}`)
  }
  if ((trail.length - 1) % 3 !== 0) {
    const last = trail[trail.length - 1]
    points.push(`${Math.round(last.x)},${Math.round(last.y)}`)
  }
  return points.join(' ')
}

export default function HeroBackdrop() {
  const sim = createSim()
  for (let frame = 0; frame < FRAMES; frame += 1) step(sim, 16)

  const trails = sim.tracks.filter((track) => track.trail.length > 4)
  const boxes = sim.tracks.filter((track) => track.state === 'active')

  return (
    <svg
      viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      {/* The occlusion band the tracker has to survive. */}
      <rect
        x={OCCLUDER.x}
        y={0}
        width={OCCLUDER.w}
        height={WORLD_H}
        className="fill-ink-400/10 dark:fill-ink-500/10"
      />

      {trails.map((track) => (
        <polyline
          key={`trail-${track.id}`}
          points={trailPoints(track.trail)}
          fill="none"
          strokeWidth={0.9}
          strokeLinecap="round"
          className="stroke-ink-400/40 dark:stroke-ink-500/40"
        />
      ))}

      {boxes.map((track, index) => {
        const size = Math.round(track.r * 2.8)
        const x = Math.round(track.x - size / 2)
        const y = Math.round(track.y - size / 2)
        return (
          <g key={`box-${track.id}`}>
            <rect
              x={x}
              y={y}
              width={size}
              height={size}
              fill="none"
              strokeWidth={0.9}
              className="stroke-ink-400/50 dark:stroke-ink-500/50"
            />
            {index % 3 === 0 && (
              <text
                x={x}
                y={y - 2}
                fontSize={5.5}
                className="fill-ink-400/60 font-mono dark:fill-ink-500/60"
              >
                {track.id}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
