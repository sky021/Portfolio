/**
 * Smoke-checks a running server: every route renders, every asset referenced by
 * the site actually exists, and unknown paths still 404.
 *
 * The original site shipped with a missing public/ directory, so broken asset
 * references are the specific regression this guards against.
 *
 * Usage:
 *   npm run build && npm run start -- -p 3111
 *   npm run verify:routes -- http://127.0.0.1:3111
 *
 * Defaults to 127.0.0.1 rather than localhost: Next binds IPv4, and on hosts
 * where localhost resolves to ::1 first every request would fail to connect.
 */

import { caseStudies, currentProjects, profile } from '../content/work.ts'

const base = (process.argv[2] ?? 'http://127.0.0.1:3000').replace(/\/$/, '')

type Expectation = {
  path: string
  status?: number
  contentType?: string
  /** Substrings that must appear in a text response. */
  contains?: string[]
}

const expectations: Expectation[] = [
  {
    path: '/',
    contentType: 'text/html',
    contains: [
      profile.headline,
      'Selected work',
      'Experience',
      ...currentProjects.map((project) => project.title),
    ],
  },
  {
    path: '/work',
    contentType: 'text/html',
    contains: ['Case studies', ...currentProjects.map((project) => project.title)],
  },
  ...caseStudies.map((study) => ({
    path: `/work/${study.slug}`,
    contentType: 'text/html',
    contains: [study.title],
  })),
  { path: '/sitemap.xml', contentType: 'xml', contains: ['<urlset'] },
  { path: '/robots.txt', contentType: 'text/plain', contains: ['Sitemap:'] },
  { path: '/opengraph-image', contentType: 'image/' },
  { path: '/Akash_Agrawal.pdf', contentType: 'application/pdf' },
  { path: '/monogram.svg', contentType: 'image/svg' },
  { path: '/this-route-does-not-exist', status: 404 },
]

let passed = 0
const failures: string[] = []

function report(ok: boolean, label: string, detail = '') {
  if (ok) {
    passed += 1
    console.log(`  ok    ${label}`)
  } else {
    failures.push(`${label}${detail ? `: ${detail}` : ''}`)
    console.log(`  FAIL  ${label}${detail ? `: ${detail}` : ''}`)
  }
}

console.log(`\nchecking ${base}\n`)

for (const expectation of expectations) {
  const expectedStatus = expectation.status ?? 200
  let response: Response

  try {
    response = await fetch(base + expectation.path)
  } catch (error) {
    report(false, `${expectation.path} responds`, (error as Error).message)
    continue
  }

  report(
    response.status === expectedStatus,
    `${expectation.path} → ${expectedStatus}`,
    response.status === expectedStatus ? '' : `got ${response.status}`
  )

  const contentType = response.headers.get('content-type') ?? ''

  if (expectation.contentType) {
    report(
      contentType.includes(expectation.contentType),
      `${expectation.path} content-type`,
      contentType.includes(expectation.contentType) ? '' : `got "${contentType}"`
    )
  }

  const body = contentType.startsWith('image/') || contentType.includes('pdf') ? '' : await response.text()

  for (const needle of expectation.contains ?? []) {
    report(body.includes(needle), `${expectation.path} contains "${needle}"`)
  }

  // Any local asset the page references must resolve. This is what caught the
  // original 404ing images.
  if (contentType.includes('text/html')) {
    const assets = new Set<string>()
    for (const match of body.matchAll(/(?:src|href)="(\/[^"?#]*\.(?:png|jpe?g|svg|webp|ico|pdf|css|js))/g)) {
      assets.add(match[1])
    }

    // Images rendered through next/image are requested via the optimizer, which
    // carries the real path in a query parameter. Without unwrapping these, the
    // profile photo, the asset most likely to go missing, goes unchecked.
    for (const match of body.matchAll(/\/_next\/image\?([^"]+)"/g)) {
      const url = new URLSearchParams(match[1].replace(/&amp;/g, '&')).get('url')
      if (url?.startsWith('/')) assets.add(url)
    }

    for (const asset of assets) {
      const assetResponse = await fetch(base + asset, { method: 'GET' })
      report(
        assetResponse.ok,
        `${expectation.path} asset ${asset}`,
        assetResponse.ok ? '' : `got ${assetResponse.status}`
      )
    }
  }
}

console.log(`\n${passed} passed, ${failures.length} failed\n`)
if (failures.length > 0) process.exit(1)
