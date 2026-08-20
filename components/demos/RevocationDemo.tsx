'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import DemoFrame from './DemoFrame'
import {
  BotIcon,
  CheckIcon,
  LockIcon,
  ResetIcon,
  ShieldIcon,
  UnlockIcon,
  UserIcon,
} from '@/components/icons'
import { useOnScreen } from '@/lib/hooks'
import { createBundle, hasWebCrypto, unwrapAndDecrypt, type Bundle } from '@/lib/demos/envelope'

/**
 * Abstracted view of the content protection model.
 *
 * The cryptography is genuine; see lib/demos/envelope.ts. What is simulated is
 * the boundary: the "KMS" here is local, and the bot classifier is scripted
 * rather than a real model.
 *
 * Revocation is modelled the way the real service does it: the grant flips, and
 * the gateway simply refuses to unwrap the data key, so the caller receives
 * ciphertext instead of prose. No proprietary code or customer data is present.
 */

const ARTICLE_TITLE = 'Regional grid operators trial adaptive load balancing'
const ARTICLE_BODY = `Operators across three regions began a staged trial of adaptive load balancing this week, shifting demand between substations in response to short-term forecasts rather than fixed schedules. Early figures suggest the approach trims peak draw without additional generation capacity, though engineers cautioned that the sample covers only mild weather so far. A wider rollout depends on results from the winter window.`

const BOT_CATEGORIES = [
  'headless-browser',
  'datacenter-egress',
  'known-scraper-ua',
  'token-replay',
  'request-rate-anomaly',
  'fingerprint-mismatch',
  'unattributed-llm-crawler',
] as const

type ReadState = {
  ok: boolean
  text: string
  at: number
}

type Actor = 'reader' | 'bot'

function Pill({
  label,
  state,
}: {
  label: string
  state: 'ok' | 'blocked' | 'idle'
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${
        state === 'ok'
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : state === 'blocked'
            ? 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300'
            : 'border-ink-200 text-ink-400 dark:border-ink-800 dark:text-ink-500'
      }`}
    >
      {state === 'ok' && <CheckIcon className="h-2.5 w-2.5" />}
      {label}
    </span>
  )
}

function ActorPane({
  actor,
  granted,
  read,
  classification,
}: {
  actor: Actor
  granted: boolean
  read: ReadState | null
  classification: string | null
}) {
  const isBot = actor === 'bot'
  const Icon = isBot ? BotIcon : UserIcon

  return (
    <div
      className={`rounded-lg border p-3.5 transition-colors ${
        granted
          ? 'border-ink-200 dark:border-ink-800'
          : 'border-rose-500/40 bg-rose-500/[0.04]'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-ink-100">
          <Icon className="h-4 w-4 text-ink-500" />
          {isBot ? 'Bot client' : 'Subscribed reader'}
        </span>
        <span
          className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider ${
            granted ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {granted ? <UnlockIcon className="h-3 w-3" /> : <LockIcon className="h-3 w-3" />}
          {granted ? 'granted' : 'revoked'}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <Pill
          label={isBot ? `bot: ${classification ?? 'scanning'}` : 'human'}
          state={isBot ? 'blocked' : 'ok'}
        />
        <Pill label={granted ? 'grant allow' : 'grant deny'} state={granted ? 'ok' : 'blocked'} />
        <Pill label={granted ? 'kms unwrap' : 'unwrap refused'} state={granted ? 'ok' : 'blocked'} />
      </div>

      <div
        className={`scrollbar-slim h-44 overflow-y-auto rounded-md p-3 text-[12.5px] leading-relaxed ${
          read?.ok
            ? 'bg-ink-50 text-ink-700 dark:bg-ink-950/60 dark:text-ink-300'
            : 'bg-ink-950 font-mono text-[10.5px] leading-relaxed text-rose-300/80'
        }`}
      >
        {read === null && <p className="text-ink-500">Awaiting first request…</p>}
        {read?.ok && (
          <>
            <p className="mb-2 font-semibold text-ink-900 dark:text-ink-100">{ARTICLE_TITLE}</p>
            <p>{read.text.split('\n\n')[1] ?? read.text}</p>
          </>
        )}
        {read && !read.ok && <p className="break-all">{read.text}</p>}
      </div>

      <p className="mt-2 font-mono text-[10px] text-ink-500 dark:text-ink-500">
        {read === null
          ? 'idle'
          : read.ok
            ? 'HTTP 200 · plaintext delivered'
            : 'HTTP 403 · ciphertext returned, key unwrap refused'}
      </p>
    </div>
  )
}

/** Immutably replace one actor's slot, keeping both keys statically known. */
function withActor<T>(state: Record<Actor, T>, actor: Actor, value: T): Record<Actor, T> {
  return actor === 'reader' ? { ...state, reader: value } : { ...state, bot: value }
}

export default function RevocationDemo() {
  const [containerRef, onScreen] = useOnScreen<HTMLDivElement>()

  const bundleRef = useRef<Bundle | null>(null)
  const grantsRef = useRef<Record<Actor, boolean>>({ reader: true, bot: true })
  const revokedAtRef = useRef<number | null>(null)

  const [ready, setReady] = useState(false)
  const [unsupported, setUnsupported] = useState(false)
  const [grants, setGrants] = useState<Record<Actor, boolean>>({ reader: true, bot: true })
  const [reads, setReads] = useState<Record<Actor, ReadState | null>>({
    reader: null,
    bot: null,
  })
  const [classification, setClassification] = useState<string | null>(null)
  const [propagationMs, setPropagationMs] = useState<number | null>(null)
  const [requestCount, setRequestCount] = useState(0)

  // Provision keys and ciphertext once.
  useEffect(() => {
    let cancelled = false

    if (!hasWebCrypto()) {
      setUnsupported(true)
      return
    }

    createBundle(`${ARTICLE_TITLE}\n\n${ARTICLE_BODY}`)
      .then((bundle) => {
        if (cancelled) return
        bundleRef.current = bundle
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setUnsupported(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const attempt = useCallback(async (actor: Actor) => {
    const bundle = bundleRef.current
    if (!bundle) return

    setRequestCount((count) => count + 1)

    if (!grantsRef.current[actor]) {
      // Denied: the caller gets the stored ciphertext, never the data key.
      setReads((prev) =>
        withActor(prev, actor, {
          ok: false,
          text: bundle.ciphertextB64,
          at: Date.now(),
        })
      )

      if (actor === 'bot' && revokedAtRef.current !== null) {
        setPropagationMs(performance.now() - revokedAtRef.current)
        revokedAtRef.current = null
      }
      return
    }

    try {
      const plaintext = await unwrapAndDecrypt(bundle)
      setReads((prev) => withActor(prev, actor, { ok: true, text: plaintext, at: Date.now() }))
    } catch {
      setReads((prev) =>
        withActor(prev, actor, { ok: false, text: bundle.ciphertextB64, at: Date.now() })
      )
    }
  }, [])

  // The bot polls like a scraper; the reader requests at human pace.
  useEffect(() => {
    if (!ready || !onScreen) return

    void attempt('reader')
    void attempt('bot')

    const botTimer = setInterval(() => void attempt('bot'), 850)
    const readerTimer = setInterval(() => void attempt('reader'), 2600)

    return () => {
      clearInterval(botTimer)
      clearInterval(readerTimer)
    }
  }, [ready, onScreen, attempt])

  // Classifier cycles through categories while the bot session is live.
  useEffect(() => {
    if (!ready || !onScreen) return

    let index = 0
    setClassification(BOT_CATEGORIES[0])

    const timer = setInterval(() => {
      index = (index + 1) % BOT_CATEGORIES.length
      setClassification(BOT_CATEGORIES[index])
    }, 1900)

    return () => clearInterval(timer)
  }, [ready, onScreen])

  const setGrant = useCallback((actor: Actor, value: boolean) => {
    grantsRef.current = withActor(grantsRef.current, actor, value)
    setGrants(grantsRef.current)
    if (actor === 'bot' && !value) {
      revokedAtRef.current = performance.now()
      setPropagationMs(null)
    }
  }, [])

  const reset = useCallback(() => {
    grantsRef.current = { reader: true, bot: true }
    setGrants(grantsRef.current)
    setReads({ reader: null, bot: null })
    setPropagationMs(null)
    setRequestCount(0)
    revokedAtRef.current = null
  }, [])

  return (
    <div ref={containerRef}>
      <DemoFrame
        title="Per-User Content Revocation"
        subtitle="One encrypted article, two callers. Revoke the bot and its next poll returns ciphertext while the subscribed reader keeps reading."
        kind="abstracted"
        note="Abstracted representation containing no proprietary code, customer data, or production configuration. The envelope encryption is real: AES-GCM via Web Crypto, with a per-article data key wrapped under a non-extractable master key. The KMS boundary and the bot classifier are simulated locally."
        controls={
          <>
            <button
              type="button"
              onClick={() => setGrant('bot', !grants.bot)}
              className={grants.bot ? 'btn-primary !px-3 !py-2 !text-xs' : 'btn-ghost !px-3 !py-2 !text-xs'}
            >
              {grants.bot ? <LockIcon className="h-3.5 w-3.5" /> : <UnlockIcon className="h-3.5 w-3.5" />}
              {grants.bot ? 'Revoke bot access' : 'Restore bot access'}
            </button>
            <button type="button" onClick={reset} className="btn-ghost !px-3 !py-2 !text-xs">
              <ResetIcon className="h-3.5 w-3.5" />
              Reset
            </button>
          </>
        }
        footer={
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">AES-256-GCM</span>
            <span className="chip">Envelope encryption</span>
            <span className="chip">7 bot categories</span>
            <span className="chip">Per-user, per-article grants</span>
          </div>
        }
      >
        {unsupported && (
          <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-[13px] text-amber-800 dark:text-amber-200">
            This browser did not expose Web Crypto in a secure context, so the live encryption step
            is unavailable here.
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
          <div className="grid gap-3 sm:grid-cols-2">
            <ActorPane
              actor="reader"
              granted={grants.reader}
              read={reads.reader}
              classification={null}
            />
            <ActorPane
              actor="bot"
              granted={grants.bot}
              read={reads.bot}
              classification={classification}
            />
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-ink-200 p-3 dark:border-ink-800">
              <p className="label-mono mb-2">Revocation latency</p>
              <p className="font-mono text-2xl font-semibold tabular-nums text-ink-900 dark:text-ink-50">
                {propagationMs === null ? 'N/A' : `${Math.round(propagationMs)} ms`}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-500 dark:text-ink-400">
                This local value measures the revoke click to the first refused bot poll. It does
                not measure the production service. The sub-second production result is reported
                separately in the resume.
              </p>
            </div>

            <div className="rounded-lg border border-ink-200 p-3 dark:border-ink-800">
              <p className="label-mono mb-2.5">Envelope</p>
              <ol className="space-y-2 text-[11.5px] leading-relaxed text-ink-600 dark:text-ink-400">
                <li className="flex gap-2">
                  <ShieldIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <span>Master key generated non-extractable; never leaves the boundary.</span>
                </li>
                <li className="flex gap-2">
                  <LockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>Article encrypted once under a per-article data key.</span>
                </li>
                <li className="flex gap-2">
                  <UnlockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-500" />
                  <span>
                    Each allowed read unwraps the data key, then decrypts. A denied read stops
                    before unwrap, so plaintext is never produced.
                  </span>
                </li>
              </ol>
            </div>

            <div className="rounded-lg border border-ink-200 p-3 dark:border-ink-800">
              <div className="flex justify-between text-[12px]">
                <span className="text-ink-500 dark:text-ink-400">Requests served</span>
                <span className="font-mono tabular-nums text-ink-800 dark:text-ink-200">
                  {requestCount}
                </span>
              </div>
              <div className="mt-1.5 flex justify-between text-[12px]">
                <span className="text-ink-500 dark:text-ink-400">Ciphertext size</span>
                <span className="font-mono tabular-nums text-ink-800 dark:text-ink-200">
                  {bundleRef.current ? `${bundleRef.current.ciphertextB64.length} B` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DemoFrame>
    </div>
  )
}
