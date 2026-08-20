'use client'

import { useMemo } from 'react'
import type { Diagram, DiagramNode, DiagramNodeKind } from '@/content/work'
import { useOnScreen, usePrefersReducedMotion } from '@/lib/hooks'

/**
 * Renders an architecture diagram from a declarative node/edge spec.
 *
 * Diagrams are drawn as SVG rather than shipped as images so they stay crisp at
 * any zoom, adapt to light and dark themes, and can animate their data flow.
 */

const NODE_W = 138
const NODE_H = 60
const COL_GAP = 66
const ROW_GAP = 36
const PAD = 14

const kindAccent: Record<DiagramNodeKind, string> = {
  client: 'fill-ink-400',
  gateway: 'fill-accent-500',
  compute: 'fill-violet-500',
  store: 'fill-emerald-500',
  model: 'fill-fuchsia-500',
  queue: 'fill-amber-500',
  security: 'fill-rose-500',
}

const kindLabel: Record<DiagramNodeKind, string> = {
  client: 'Client',
  gateway: 'Gateway',
  compute: 'Compute',
  store: 'Storage',
  model: 'Model',
  queue: 'Queue',
  security: 'Security',
}

function nodeX(col: number) {
  return PAD + col * (NODE_W + COL_GAP)
}

function nodeY(row: number) {
  return PAD + row * (NODE_H + ROW_GAP)
}

type Anchors = { path: string; labelX: number; labelY: number }

/**
 * Routes an edge between two grid nodes. Forward edges leave the right face and
 * enter the left face; backward edges (retry/feedback loops) dip below both
 * nodes so they read as a distinct return path; same-column edges run vertically.
 */
function routeEdge(from: DiagramNode, to: DiagramNode): Anchors {
  const fx = nodeX(from.col)
  const fy = nodeY(from.row)
  const tx = nodeX(to.col)
  const ty = nodeY(to.row)
  const fCenterY = fy + NODE_H / 2
  const tCenterY = ty + NODE_H / 2
  const fCenterX = fx + NODE_W / 2
  const tCenterX = tx + NODE_W / 2

  if (to.col > from.col) {
    const startX = fx + NODE_W
    const endX = tx
    const midX = (startX + endX) / 2
    return {
      path: `M ${startX} ${fCenterY} C ${midX} ${fCenterY}, ${midX} ${tCenterY}, ${endX} ${tCenterY}`,
      labelX: midX,
      labelY: (fCenterY + tCenterY) / 2 - 8,
    }
  }

  if (to.col < from.col) {
    const dip = NODE_H / 2 + 26
    const startY = fy + NODE_H
    const endY = ty + NODE_H
    const bottom = Math.max(startY, endY) + dip
    return {
      path: `M ${fCenterX} ${startY} C ${fCenterX} ${bottom}, ${tCenterX} ${bottom}, ${tCenterX} ${endY}`,
      labelX: (fCenterX + tCenterX) / 2,
      labelY: bottom - 4,
    }
  }

  // Same column: connect the facing horizontal edges.
  const goingDown = to.row > from.row
  const startY = goingDown ? fy + NODE_H : fy
  const endY = goingDown ? ty : ty + NODE_H
  return {
    path: `M ${fCenterX} ${startY} L ${tCenterX} ${endY}`,
    labelX: fCenterX + 6,
    labelY: (startY + endY) / 2,
  }
}

export default function ArchitectureDiagram({
  diagram,
  className = '',
}: {
  diagram: Diagram
  className?: string
}) {
  const [ref, onScreen] = useOnScreen<HTMLElement>()
  const reduced = usePrefersReducedMotion()
  const animate = onScreen && !reduced

  const width = PAD * 2 + diagram.cols * NODE_W + (diagram.cols - 1) * COL_GAP
  // Feedback edges dip below the last row, so leave headroom for them.
  const height = PAD * 2 + diagram.rows * NODE_H + (diagram.rows - 1) * ROW_GAP + 34

  const nodeById = useMemo(() => {
    const map = new Map<string, DiagramNode>()
    for (const node of diagram.nodes) map.set(node.id, node)
    return map
  }, [diagram.nodes])

  const edges = useMemo(
    () =>
      diagram.edges
        .map((edge) => {
          const from = nodeById.get(edge.from)
          const to = nodeById.get(edge.to)
          if (!from || !to) return null
          return { ...edge, ...routeEdge(from, to) }
        })
        .filter((edge): edge is NonNullable<typeof edge> => edge !== null),
    [diagram.edges, nodeById]
  )

  const kindsUsed = useMemo(() => {
    const set = new Set<DiagramNodeKind>()
    for (const node of diagram.nodes) set.add(node.kind)
    return Array.from(set)
  }, [diagram.nodes])

  return (
    <figure ref={ref} className={className}>
      <div className="surface scrollbar-slim overflow-x-auto p-4 sm:p-6">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={{ minWidth: Math.min(width, 720) }}
          role="img"
          aria-label={diagram.caption ?? 'System architecture diagram'}
          className="h-auto overflow-visible"
        >
          <defs>
            <marker
              id="arrowhead"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-ink-400 dark:fill-ink-600" />
            </marker>
          </defs>

          <g>
            {edges.map((edge, index) => (
              <g key={`${edge.from}-${edge.to}-${index}`}>
                <path
                  d={edge.path}
                  fill="none"
                  strokeWidth={1.5}
                  strokeDasharray={edge.async ? '5 4' : undefined}
                  markerEnd="url(#arrowhead)"
                  className="stroke-ink-300 dark:stroke-ink-700"
                />
                {animate && (
                  <path
                    d={edge.path}
                    fill="none"
                    strokeWidth={2}
                    strokeDasharray="4 20"
                    className="animate-flow stroke-accent-500/70"
                    style={{ animationDelay: `${index * 180}ms` }}
                  />
                )}
                {edge.label && (
                  <text
                    x={edge.labelX}
                    y={edge.labelY}
                    textAnchor="middle"
                    fontSize={10}
                    strokeWidth={4}
                    paintOrder="stroke"
                    className="fill-ink-500 stroke-white font-mono dark:fill-ink-400 dark:stroke-ink-900"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            ))}
          </g>

          <g>
            {diagram.nodes.map((node) => {
              const x = nodeX(node.col)
              const y = nodeY(node.row)
              return (
                <g key={node.id}>
                  <rect
                    x={x}
                    y={y}
                    width={NODE_W}
                    height={NODE_H}
                    rx={10}
                    strokeWidth={1}
                    className="fill-white stroke-ink-200 dark:fill-ink-900 dark:stroke-ink-700"
                  />
                  <rect
                    x={x}
                    y={y + 12}
                    width={3}
                    height={NODE_H - 24}
                    rx={1.5}
                    className={kindAccent[node.kind]}
                  />
                  <text
                    x={x + 14}
                    y={node.sublabel ? y + 25 : y + 34}
                    fontSize={12.5}
                    fontWeight={600}
                    className="fill-ink-900 dark:fill-ink-100"
                  >
                    {node.label}
                  </text>
                  {node.sublabel && (
                    <text
                      x={x + 14}
                      y={y + 42}
                      fontSize={10}
                      className="fill-ink-500 font-mono dark:fill-ink-400"
                    >
                      {node.sublabel}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {kindsUsed.map((kind) => (
          <span key={kind} className="inline-flex items-center gap-1.5">
            <svg viewBox="0 0 8 8" className="h-2 w-2" aria-hidden="true">
              <circle cx="4" cy="4" r="4" className={kindAccent[kind]} />
            </svg>
            <span className="label-mono">{kindLabel[kind]}</span>
          </span>
        ))}
      </div>

      {diagram.caption && (
        <figcaption className="mt-3 text-sm text-ink-500 dark:text-ink-400">
          {diagram.caption}
        </figcaption>
      )}
    </figure>
  )
}
