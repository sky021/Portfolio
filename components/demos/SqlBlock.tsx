'use client'

import { Fragment, useMemo } from 'react'

/**
 * Lightweight SQL syntax highlighting. Hand-rolled rather than pulling in a
 * highlighter dependency, since the grammar shown here is small and known.
 */

const TOKEN_PATTERN =
  /('(?:[^']|'')*')|(\b(?:SELECT|DISTINCT|FROM|LEFT|INNER|OUTER|JOIN|ON|WHERE|GROUP|BY|HAVING|ORDER|LIMIT|AND|OR|NOT|IN|IS|NULL|LIKE|BETWEEN|ASC|DESC|AS|CASE|WHEN|THEN|ELSE|END)\b)|(\b(?:COUNT|SUM|AVG|MIN|MAX|ROUND|COALESCE|IFNULL|UPPER|LOWER|LENGTH|ABS)\b)|(\b\d+(?:\.\d+)?\b)/gi

type Segment = { text: string; type: 'plain' | 'string' | 'keyword' | 'func' | 'number' }

function segment(sql: string): Segment[] {
  const segments: Segment[] = []
  let lastIndex = 0

  // Reset because the regex is module-scoped and stateful with /g.
  TOKEN_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null = TOKEN_PATTERN.exec(sql)
  while (match !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: sql.slice(lastIndex, match.index), type: 'plain' })
    }

    const type: Segment['type'] = match[1]
      ? 'string'
      : match[2]
        ? 'keyword'
        : match[3]
          ? 'func'
          : 'number'

    segments.push({ text: match[0], type })
    lastIndex = match.index + match[0].length
    match = TOKEN_PATTERN.exec(sql)
  }

  if (lastIndex < sql.length) {
    segments.push({ text: sql.slice(lastIndex), type: 'plain' })
  }

  return segments
}

const classFor: Record<Segment['type'], string> = {
  plain: 'text-ink-700 dark:text-ink-200',
  string: 'text-emerald-600 dark:text-emerald-400',
  keyword: 'font-semibold text-violet-600 dark:text-violet-400',
  func: 'text-accent-600 dark:text-accent-300',
  number: 'text-amber-600 dark:text-amber-400',
}

export default function SqlBlock({
  sql,
  className = '',
}: {
  sql: string
  className?: string
}) {
  const segments = useMemo(() => segment(sql), [sql])

  return (
    <pre
      className={`scrollbar-slim overflow-x-auto rounded-lg bg-ink-50 p-3.5 font-mono text-[12.5px] leading-relaxed dark:bg-ink-950/70 ${className}`}
    >
      <code>
        {segments.map((part, index) => (
          <Fragment key={index}>
            <span className={classFor[part.type]}>{part.text}</span>
          </Fragment>
        ))}
      </code>
    </pre>
  )
}
