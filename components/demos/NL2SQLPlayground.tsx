'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import DemoFrame from './DemoFrame'
import SqlBlock from './SqlBlock'
import {
  AlertIcon,
  CheckIcon,
  DatabaseIcon,
  PlayIcon,
  ResetIcon,
  TerminalIcon,
} from '@/components/icons'
import { runQuery, type QueryResult, type SqlValue } from '@/lib/sql/engine'
import { datasetSummary, demoDatabase, schemaChunks } from '@/lib/sql/dataset'
import {
  pipelineStages,
  scenarios,
  type Scenario,
  type StageId,
} from '@/lib/demos/nl2sql-scenarios'
import { useOnScreen, usePrefersReducedMotion } from '@/lib/hooks'

type Phase = 'idle' | StageId | 'failed'

type AttemptState = {
  sql: string
  reasoning: string
  repairNote?: string
  status: 'running' | 'failed' | 'ok'
  error?: string
  result?: QueryResult
}

function formatValue(value: SqlValue): string {
  if (value === null) return 'NULL'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toLocaleString('en-US')
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return value
}

function ResultTable({ result }: { result: QueryResult }) {
  const visibleRows = result.rows.slice(0, 12)

  return (
    <div>
      <div className="scrollbar-slim max-h-72 overflow-auto rounded-lg border border-ink-200 dark:border-ink-800">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead className="sticky top-0 bg-ink-50 dark:bg-ink-900">
            <tr>
              {result.columns.map((column, index) => (
                <th
                  key={`${column}-${index}`}
                  className="whitespace-nowrap border-b border-ink-200 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:border-ink-800 dark:text-ink-400"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60 dark:border-ink-800/60 dark:hover:bg-ink-800/40"
              >
                {row.map((value, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`whitespace-nowrap px-3 py-2 ${
                      typeof value === 'number'
                        ? 'font-mono tabular-nums text-ink-800 dark:text-ink-200'
                        : value === null
                          ? 'font-mono text-ink-400 dark:text-ink-600'
                          : 'text-ink-700 dark:text-ink-300'
                    }`}
                  >
                    {formatValue(value)}
                  </td>
                ))}
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={Math.max(result.columns.length, 1)}
                  className="px-3 py-6 text-center text-sm text-ink-500 dark:text-ink-400"
                >
                  Query returned no rows.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 font-mono text-[11px] text-ink-500 dark:text-ink-400">
        {result.rows.length} row{result.rows.length === 1 ? '' : 's'}
        {result.rows.length > visibleRows.length && ` (showing ${visibleRows.length})`} ·{' '}
        {result.scanned.toLocaleString('en-US')} rows scanned · executed in{' '}
        {result.elapsedMs < 1 ? '<1' : result.elapsedMs.toFixed(1)}ms
      </p>
    </div>
  )
}

function StageRail({ phase }: { phase: Phase }) {
  const activeIndex =
    phase === 'idle'
      ? -1
      : phase === 'failed'
        ? pipelineStages.findIndex((stage) => stage.id === 'validate')
        : pipelineStages.findIndex((stage) => stage.id === phase)

  return (
    <ol className="flex flex-wrap items-center gap-1.5">
      {pipelineStages.map((stage, index) => {
        const isError = phase === 'failed' && index === activeIndex
        const complete = phase === 'answer' || index < activeIndex
        const active = index === activeIndex && !isError && phase !== 'answer'

        return (
          <li key={stage.id} className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
                isError
                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                  : complete
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : active
                      ? 'border-accent-500/60 bg-accent-500/10 text-accent-700 dark:text-accent-300'
                      : 'border-ink-200 text-ink-400 dark:border-ink-800 dark:text-ink-500'
              }`}
            >
              {isError ? (
                <AlertIcon className="h-3 w-3" />
              ) : complete ? (
                <CheckIcon className="h-3 w-3" />
              ) : (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    active ? 'animate-pulse bg-accent-500' : 'bg-ink-300 dark:bg-ink-700'
                  }`}
                />
              )}
              {stage.label}
            </span>
            {index < pipelineStages.length - 1 && (
              <span className="h-px w-3 bg-ink-200 dark:bg-ink-800" aria-hidden="true" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default function NL2SQLPlayground() {
  const [containerRef, onScreen] = useOnScreen<HTMLDivElement>()
  const reduced = usePrefersReducedMotion()

  const [selected, setSelected] = useState<Scenario>(scenarios[0])
  const [phase, setPhase] = useState<Phase>('idle')
  const [chunksRevealed, setChunksRevealed] = useState(false)
  const [attempts, setAttempts] = useState<AttemptState[]>([])
  const [running, setRunning] = useState(false)

  const [sandboxOpen, setSandboxOpen] = useState(false)
  const [sandboxSql, setSandboxSql] = useState(
    "SELECT region, COUNT(*) AS accounts, ROUND(AVG(mrr), 0) AS avg_mrr\nFROM customers\nGROUP BY region\nORDER BY avg_mrr DESC"
  )
  const [sandboxResult, setSandboxResult] = useState<QueryResult | null>(null)
  const [sandboxError, setSandboxError] = useState<string | null>(null)

  const runIdRef = useRef(0)
  const autoRanRef = useRef(false)

  const runScenario = useCallback(
    async (scenario: Scenario) => {
      const runId = runIdRef.current + 1
      runIdRef.current = runId
      const alive = () => runIdRef.current === runId
      const sleep = (ms: number) =>
        new Promise<void>((resolve) => setTimeout(resolve, reduced ? 20 : ms))

      setRunning(true)
      setAttempts([])
      setChunksRevealed(false)
      setPhase('retrieve')

      await sleep(750)
      if (!alive()) return
      setChunksRevealed(true)
      await sleep(350)
      if (!alive()) return

      for (let index = 0; index < scenario.attempts.length; index += 1) {
        const attempt = scenario.attempts[index]

        setPhase('generate')
        setAttempts((prev) => [
          ...prev,
          {
            sql: attempt.sql,
            reasoning: attempt.reasoning,
            repairNote: attempt.repairNote,
            status: 'running',
          },
        ])

        await sleep(900)
        if (!alive()) return

        setPhase('validate')
        await sleep(600)
        if (!alive()) return

        // The query genuinely runs; a bad column throws here exactly as it would
        // against a real database.
        let outcome: { ok: true; result: QueryResult } | { ok: false; error: string }
        try {
          outcome = { ok: true, result: runQuery(attempt.sql, demoDatabase) }
        } catch (error) {
          outcome = {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          }
        }

        if (!outcome.ok) {
          const message = outcome.error
          setAttempts((prev) =>
            prev.map((item, itemIndex) =>
              itemIndex === index ? { ...item, status: 'failed', error: message } : item
            )
          )

          const hasRepair = index < scenario.attempts.length - 1
          if (!hasRepair) {
            setPhase('failed')
            setRunning(false)
            return
          }

          setPhase('failed')
          await sleep(1400)
          if (!alive()) return
          continue
        }

        const value = outcome.result
        setPhase('execute')
        await sleep(550)
        if (!alive()) return

        setAttempts((prev) =>
          prev.map((item, itemIndex) =>
            itemIndex === index ? { ...item, status: 'ok', result: value } : item
          )
        )
        setPhase('answer')
        setRunning(false)
        return
      }

      setRunning(false)
    },
    [reduced]
  )

  const selectScenario = useCallback(
    (scenario: Scenario) => {
      setSelected(scenario)
      void runScenario(scenario)
    },
    [runScenario]
  )

  const reset = useCallback(() => {
    runIdRef.current += 1
    setPhase('idle')
    setAttempts([])
    setChunksRevealed(false)
    setRunning(false)
  }, [])

  // Run once when the demo first scrolls into view so the pipeline is already
  // telling its story without requiring a click.
  useEffect(() => {
    if (onScreen && !autoRanRef.current) {
      autoRanRef.current = true
      void runScenario(scenarios[0])
    }
  }, [onScreen, runScenario])

  useEffect(() => {
    return () => {
      runIdRef.current += 1
    }
  }, [])

  const runSandbox = useCallback(() => {
    try {
      setSandboxResult(runQuery(sandboxSql, demoDatabase))
      setSandboxError(null)
    } catch (error) {
      setSandboxResult(null)
      setSandboxError(error instanceof Error ? error.message : String(error))
    }
  }, [sandboxSql])

  const successful = attempts.find((attempt) => attempt.status === 'ok')

  return (
    <div ref={containerRef}>
      <DemoFrame
        title="NL2SQL Agent Playground"
        subtitle="Ask in English, watch the agent retrieve schema, generate SQL, validate it, and repair itself when it gets a column wrong."
        kind="live"
        note="The SQL is executed by a TypeScript query engine against a five-table in-browser dataset. Results, row counts, timings, and errors are computed live. The retrieval scores, model reasoning, and repair sequence are curated demonstrations based on the project architecture and reported resume metrics; no language model runs in this page."
        controls={
          <>
            <button
              type="button"
              onClick={() => void runScenario(selected)}
              disabled={running}
              className="btn-ghost !px-3 !py-2 !text-xs"
            >
              <PlayIcon className="h-3 w-3" />
              {running ? 'Running' : 'Re-run'}
            </button>
            <button type="button" onClick={reset} className="btn-ghost !px-3 !py-2 !text-xs">
              <ResetIcon className="h-3.5 w-3.5" />
              Reset
            </button>
          </>
        }
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="chip">0.71 retrieval precision</span>
              <span className="chip">60% fewer hallucinations</span>
              <span className="chip">3 bounded repair attempts</span>
            </div>
            <button
              type="button"
              onClick={() => setSandboxOpen((open) => !open)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-700 hover:text-accent-600 dark:text-accent-300"
            >
              <TerminalIcon className="h-3.5 w-3.5" />
              {sandboxOpen ? 'Hide SQL sandbox' : 'Write your own SQL'}
            </button>
          </div>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          {/* Question picker */}
          <div>
            <p className="label-mono mb-2.5">Ask a question</p>
            <ul className="space-y-1.5">
              {scenarios.map((scenario) => {
                const isSelected = scenario.id === selected.id
                return (
                  <li key={scenario.id}>
                    <button
                      type="button"
                      onClick={() => selectScenario(scenario)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-left text-[13px] leading-snug transition-colors ${
                        isSelected
                          ? 'border-accent-500/60 bg-accent-500/10 text-ink-900 dark:text-ink-50'
                          : 'border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50 dark:border-ink-800 dark:text-ink-400 dark:hover:border-ink-700 dark:hover:bg-ink-800/60'
                      }`}
                    >
                      {scenario.question}
                      {scenario.attempts.length > 1 && (
                        <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          triggers repair loop
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="mt-4 rounded-lg border border-ink-200 p-3 dark:border-ink-800">
              <p className="label-mono mb-2">Schema corpus</p>
              <ul className="space-y-1.5">
                {schemaChunks.map((chunk) => {
                  const hit = selected.retrieval.find((item) => item.table === chunk.table)
                  const isSelected = chunksRevealed && hit?.selected
                  return (
                    <li
                      key={chunk.table}
                      className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 font-mono text-[11px] transition-colors ${
                        isSelected
                          ? 'bg-accent-500/10 text-accent-700 dark:text-accent-300'
                          : 'text-ink-500 dark:text-ink-500'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <DatabaseIcon className="h-3 w-3 shrink-0" />
                        {chunk.table}
                      </span>
                      {chunksRevealed && hit && (
                        <span className={isSelected ? 'font-semibold' : 'opacity-60'}>
                          {hit.score.toFixed(2)}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
              <p className="mt-2.5 text-[11px] leading-relaxed text-ink-500 dark:text-ink-500">
                {datasetSummary.tableCount} tables ·{' '}
                {datasetSummary.rowCount.toLocaleString('en-US')} rows in browser memory
              </p>
            </div>
          </div>

          {/* Pipeline output */}
          <div className="min-w-0 space-y-4">
            <StageRail phase={phase} />

            <div className="rounded-lg border border-ink-200 bg-ink-50/60 p-3.5 dark:border-ink-800 dark:bg-ink-900/40">
              <p className="label-mono mb-1.5">Interpreted intent</p>
              <p className="text-[13px] text-ink-700 dark:text-ink-300">{selected.intent}</p>
            </div>

            {attempts.length === 0 && (
              <p className="rounded-lg border border-dashed border-ink-300 px-4 py-8 text-center text-sm text-ink-500 dark:border-ink-700 dark:text-ink-400">
                Pick a question to run the agent.
              </p>
            )}

            {attempts.map((attempt, index) => (
              <div
                key={index}
                className={`rounded-lg border p-3.5 ${
                  attempt.status === 'failed'
                    ? 'border-rose-500/40 bg-rose-500/5'
                    : attempt.status === 'ok'
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-ink-200 dark:border-ink-800'
                }`}
              >
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="label-mono">
                    Attempt {index + 1} of {selected.attempts.length}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider ${
                      attempt.status === 'failed'
                        ? 'text-rose-600 dark:text-rose-400'
                        : attempt.status === 'ok'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-accent-600 dark:text-accent-400'
                    }`}
                  >
                    {attempt.status === 'failed' && <AlertIcon className="h-3 w-3" />}
                    {attempt.status === 'ok' && <CheckIcon className="h-3 w-3" />}
                    {attempt.status === 'running'
                      ? 'generating'
                      : attempt.status === 'failed'
                        ? 'rejected'
                        : 'accepted'}
                  </span>
                </div>

                <p className="mb-2.5 text-[13px] leading-relaxed text-ink-600 dark:text-ink-400">
                  {attempt.reasoning}
                </p>

                <SqlBlock sql={attempt.sql} />

                {attempt.error && (
                  <div className="mt-2.5 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3">
                    <p className="font-mono text-[12px] text-rose-700 dark:text-rose-300">
                      SqlError: {attempt.error}
                    </p>
                    {attempt.repairNote && (
                      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-600 dark:text-ink-400">
                        {attempt.repairNote}
                      </p>
                    )}
                  </div>
                )}

                {attempt.result && (
                  <div className="mt-3">
                    <ResultTable result={attempt.result} />
                  </div>
                )}
              </div>
            ))}

            {successful && (
              <p className="border-l-2 border-accent-500 pl-3 text-[13px] italic leading-relaxed text-ink-600 dark:text-ink-400">
                {selected.insight}
              </p>
            )}
          </div>
        </div>

        {sandboxOpen && (
          <div className="mt-6 border-t border-ink-200 pt-5 dark:border-ink-800">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="label-mono">SQL sandbox</p>
                <p className="mt-1 text-[13px] text-ink-600 dark:text-ink-400">
                  Same engine, no guardrails. Try a join, an aggregate, a HAVING clause, or a
                  column that does not exist.
                </p>
              </div>
              <button type="button" onClick={runSandbox} className="btn-primary !px-4 !py-2 !text-xs">
                <PlayIcon className="h-3 w-3" />
                Execute
              </button>
            </div>

            <textarea
              value={sandboxSql}
              onChange={(event) => setSandboxSql(event.target.value)}
              spellCheck={false}
              rows={6}
              aria-label="SQL query"
              className="scrollbar-slim w-full resize-y rounded-lg border border-ink-200 bg-ink-50 p-3.5 font-mono text-[12.5px] leading-relaxed text-ink-800 outline-none focus:border-accent-500 dark:border-ink-800 dark:bg-ink-950/70 dark:text-ink-200"
            />

            {sandboxError && (
              <p className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 font-mono text-[12px] text-rose-700 dark:text-rose-300">
                SqlError: {sandboxError}
              </p>
            )}

            {sandboxResult && (
              <div className="mt-3">
                <ResultTable result={sandboxResult} />
              </div>
            )}
          </div>
        )}
      </DemoFrame>
    </div>
  )
}
