/**
 * Verification harness for the browser SQL engine.
 *
 * Run with a Node build that supports TypeScript type stripping:
 *   node --experimental-strip-types scripts/verify-sql.mts
 *
 * Checks the engine against independently computed expectations derived from the
 * raw dataset rows, so the assertions do not just restate the engine's output.
 */

import { runQuery, SqlError, type SqlValue } from '../lib/sql/engine.ts'
import { demoDatabase } from '../lib/sql/dataset.ts'
import { scenarios } from '../lib/demos/nl2sql-scenarios.ts'

let passed = 0
let failed = 0
const failures: string[] = []

function check(name: string, condition: boolean, detail = '') {
  if (condition) {
    passed += 1
  } else {
    failed += 1
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
    return
  }
  console.log(`  ok    ${name}`)
}

function expectThrows(name: string, sql: string, matcher: RegExp) {
  try {
    runQuery(sql, demoDatabase)
    check(name, false, 'expected an error but the query succeeded')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    check(name, error instanceof SqlError && matcher.test(message), `got: ${message}`)
  }
}

function rowsOf(table: string): Record<string, SqlValue>[] {
  const found = demoDatabase.tables.find((item) => item.name === table)
  if (!found) throw new Error(`fixture missing table ${table}`)
  return found.rows
}

const customers = rowsOf('customers')
const orders = rowsOf('orders')
const orderItems = rowsOf('order_items')
const products = rowsOf('products')
const tickets = rowsOf('support_tickets')

function approx(a: number, b: number, tolerance = 0.05): boolean {
  return Math.abs(a - b) <= tolerance
}

console.log('\n== dataset shape ==')
check('customers seeded', customers.length === 48, `${customers.length}`)
check('orders seeded', orders.length === 190, `${orders.length}`)
check('order_items seeded', orderItems.length > 190, `${orderItems.length}`)
check('products seeded', products.length === 16, `${products.length}`)
check('support_tickets seeded', tickets.length === 140, `${tickets.length}`)
check(
  'some tickets are unresolved (NULL resolution_hours)',
  tickets.some((row) => row.resolution_hours === null)
)
check(
  'enterprise customers exist',
  customers.some((row) => row.plan === 'Enterprise')
)

console.log('\n== scenario traces ==')
for (const scenario of scenarios) {
  scenario.attempts.forEach((attempt, index) => {
    const isLast = index === scenario.attempts.length - 1
    const label = `${scenario.id} attempt ${index + 1}`

    if (attempt.repairNote) {
      // Attempts carrying a repair note are expected to be rejected.
      expectThrows(`${label} is rejected`, attempt.sql, /no such column|no such table|no such function/)
      return
    }

    try {
      const result = runQuery(attempt.sql, demoDatabase)
      check(`${label} executes`, true)
      if (isLast) {
        check(`${label} returns rows`, result.rows.length > 0, `${result.rows.length} rows`)
        check(
          `${label} row width matches columns`,
          result.rows.every((row) => row.length === result.columns.length)
        )
      }
    } catch (error) {
      check(`${label} executes`, false, error instanceof Error ? error.message : String(error))
    }
  })
}

console.log('\n== aggregate correctness vs independent computation ==')

// Completed revenue by region.
{
  const customerById = new Map(customers.map((row) => [row.id as number, row]))
  const expected = new Map<string, { revenue: number; count: number }>()
  for (const order of orders) {
    if (order.status !== 'completed') continue
    const customer = customerById.get(order.customer_id as number)
    if (!customer) continue
    const region = customer.region as string
    const bucket = expected.get(region) ?? { revenue: 0, count: 0 }
    bucket.revenue += order.amount as number
    bucket.count += 1
    expected.set(region, bucket)
  }

  const result = runQuery(
    `SELECT c.region, ROUND(SUM(o.amount), 2) AS revenue, COUNT(*) AS orders
     FROM orders o JOIN customers c ON o.customer_id = c.id
     WHERE o.status = 'completed'
     GROUP BY c.region
     ORDER BY revenue DESC`,
    demoDatabase
  )

  check('revenue groups match region count', result.rows.length === expected.size, `${result.rows.length} vs ${expected.size}`)

  let allMatch = true
  for (const row of result.rows) {
    const region = row[0] as string
    const revenue = row[1] as number
    const count = row[2] as number
    const truth = expected.get(region)
    if (!truth) {
      allMatch = false
      break
    }
    if (!approx(revenue, Math.round(truth.revenue * 100) / 100, 0.02) || count !== truth.count) {
      allMatch = false
      console.log(`    region ${region}: engine ${revenue}/${count} vs truth ${truth.revenue.toFixed(2)}/${truth.count}`)
      break
    }
  }
  check('revenue and order counts match per region', allMatch)

  const revenues = result.rows.map((row) => row[1] as number)
  check(
    'ORDER BY on an output alias sorts descending',
    revenues.every((value, index) => index === 0 || revenues[index - 1] >= value)
  )
}

// AVG must skip NULLs.
{
  const bySeverity = new Map<string, number[]>()
  for (const ticket of tickets) {
    if (ticket.resolution_hours === null) continue
    const key = ticket.severity as string
    const bucket = bySeverity.get(key) ?? []
    bucket.push(ticket.resolution_hours as number)
    bySeverity.set(key, bucket)
  }

  const result = runQuery(
    `SELECT severity, COUNT(*) AS tickets, COUNT(resolution_hours) AS resolved,
            ROUND(AVG(resolution_hours), 1) AS avg_hours
     FROM support_tickets GROUP BY severity ORDER BY avg_hours`,
    demoDatabase
  )

  let avgOk = true
  let countsOk = true
  for (const row of result.rows) {
    const severity = row[0] as string
    const total = row[1] as number
    const resolved = row[2] as number
    const avg = row[3] as number
    const values = bySeverity.get(severity) ?? []
    const truthAvg = values.reduce((sum, value) => sum + value, 0) / values.length
    if (!approx(avg, Math.round(truthAvg * 10) / 10, 0.06)) {
      avgOk = false
      console.log(`    ${severity}: engine avg ${avg} vs truth ${truthAvg.toFixed(2)}`)
    }
    if (resolved !== values.length || total < resolved) countsOk = false
  }
  check('AVG ignores NULL and matches independent mean', avgOk)
  check('COUNT(col) counts non-null, COUNT(*) counts all', countsOk)
}

// SUM over an expression across a join.
{
  const productById = new Map(products.map((row) => [row.id as number, row]))
  const expected = new Map<string, number>()
  for (const item of orderItems) {
    const product = productById.get(item.product_id as number)
    if (!product) continue
    const category = product.category as string
    expected.set(category, (expected.get(category) ?? 0) + (item.quantity as number))
  }

  const result = runQuery(
    `SELECT p.category, SUM(i.quantity) AS units_sold
     FROM order_items i JOIN products p ON i.product_id = p.id
     GROUP BY p.category ORDER BY units_sold DESC`,
    demoDatabase
  )

  let ok = result.rows.length === expected.size
  for (const row of result.rows) {
    if (expected.get(row[0] as string) !== (row[1] as number)) ok = false
  }
  check('SUM over a joined expression matches', ok)
}

// COUNT(DISTINCT ...) on the repaired critical-ticket query.
{
  const enterpriseIds = new Set(
    customers.filter((row) => row.plan === 'Enterprise').map((row) => row.id as number)
  )
  const criticalEnterprise = tickets.filter(
    (row) => row.severity === 'critical' && enterpriseIds.has(row.customer_id as number)
  )
  const distinctAccounts = new Set(criticalEnterprise.map((row) => row.customer_id as number))

  const result = runQuery(
    `SELECT COUNT(DISTINCT c.id) AS enterprise_customers, COUNT(*) AS critical_tickets
     FROM customers c JOIN support_tickets t ON t.customer_id = c.id
     WHERE c.plan = 'Enterprise' AND t.severity = 'critical'`,
    demoDatabase
  )

  check('aggregate-only query returns exactly one row', result.rows.length === 1)
  check(
    'COUNT(DISTINCT) matches distinct account count',
    result.rows[0][0] === distinctAccounts.size,
    `engine ${result.rows[0][0]} vs truth ${distinctAccounts.size}`
  )
  check(
    'COUNT(*) matches matching ticket count',
    result.rows[0][1] === criticalEnterprise.length,
    `engine ${result.rows[0][1]} vs truth ${criticalEnterprise.length}`
  )
}

console.log('\n== clause and operator coverage ==')

{
  const result = runQuery('SELECT plan, COUNT(*) AS n FROM customers GROUP BY plan HAVING COUNT(*) > 8', demoDatabase)
  check('HAVING filters groups', result.rows.every((row) => (row[1] as number) > 8))
}

{
  const result = runQuery('SELECT DISTINCT region FROM customers', demoDatabase)
  const unique = new Set(customers.map((row) => row.region as string))
  check('DISTINCT dedupes', result.rows.length === unique.size, `${result.rows.length} vs ${unique.size}`)
}

{
  const result = runQuery('SELECT name FROM customers ORDER BY name LIMIT 5', demoDatabase)
  check('LIMIT caps rows', result.rows.length === 5)
  const names = result.rows.map((row) => row[0] as string)
  check(
    'ORDER BY ascending on text',
    names.every((value, index) => index === 0 || names[index - 1] <= value)
  )
}

{
  const result = runQuery("SELECT id FROM customers WHERE plan IN ('Pro', 'Business')", demoDatabase)
  const truth = customers.filter((row) => row.plan === 'Pro' || row.plan === 'Business').length
  check('IN list filters', result.rows.length === truth, `${result.rows.length} vs ${truth}`)
}

{
  const result = runQuery("SELECT id FROM customers WHERE name LIKE '%Labs'", demoDatabase)
  const truth = customers.filter((row) => (row.name as string).endsWith('Labs')).length
  check('LIKE with wildcard', result.rows.length === truth, `${result.rows.length} vs ${truth}`)
}

{
  const result = runQuery('SELECT id FROM orders WHERE amount BETWEEN 1000 AND 5000', demoDatabase)
  const truth = orders.filter((row) => (row.amount as number) >= 1000 && (row.amount as number) <= 5000).length
  check('BETWEEN is inclusive', result.rows.length === truth, `${result.rows.length} vs ${truth}`)
}

{
  const result = runQuery(
    'SELECT id, resolution_hours FROM support_tickets WHERE resolution_hours IS NULL',
    demoDatabase
  )
  const truth = tickets.filter((row) => row.resolution_hours === null).length
  check('IS NULL matches', result.rows.length === truth, `${result.rows.length} vs ${truth}`)
  check('NULL renders as null value', result.rows.every((row) => row[1] === null))
}

{
  const result = runQuery(
    `SELECT CASE WHEN mrr > 500 THEN 'large' WHEN mrr > 0 THEN 'paid' ELSE 'free' END AS band,
            COUNT(*) AS n
     FROM customers GROUP BY band ORDER BY n DESC`,
    demoDatabase
  )
  const total = result.rows.reduce((sum, row) => sum + (row[1] as number), 0)
  check('CASE expression groups and totals correctly', total === customers.length, `${total} vs ${customers.length}`)
}

{
  // LEFT JOIN must retain rows with no match and fill NULLs.
  const result = runQuery(
    `SELECT c.id, t.id FROM customers c
     LEFT JOIN support_tickets t ON t.customer_id = c.id AND t.severity = 'critical'`,
    demoDatabase
  )
  check('LEFT JOIN keeps unmatched rows', result.rows.some((row) => row[1] === null))
  const distinctCustomers = new Set(result.rows.map((row) => row[0] as number))
  check('LEFT JOIN covers every customer', distinctCustomers.size === customers.length)
}

{
  const result = runQuery('SELECT * FROM products ORDER BY 3 DESC LIMIT 3', demoDatabase)
  check('SELECT * expands all columns', result.columns.length === 4, result.columns.join(','))
  check('ORDER BY ordinal works', result.rows.length === 3)
}

{
  const result = runQuery(
    'SELECT COUNT(*) AS n FROM orders WHERE status = \'completed\' AND amount > 0',
    demoDatabase
  )
  check('scanned count is reported', result.scanned === orders.length, `${result.scanned}`)
  check('timing is reported', typeof result.elapsedMs === 'number' && result.elapsedMs >= 0)
}

console.log('\n== error handling ==')
expectThrows('unknown table', 'SELECT * FROM invoices', /no such table: invoices/)
expectThrows(
  'unknown qualified column',
  'SELECT t.priority FROM support_tickets t',
  /no such column: t\.priority/
)
expectThrows('unknown bare column', 'SELECT nope FROM customers', /no such column: nope/)
expectThrows(
  'ambiguous column across join',
  'SELECT id FROM customers c JOIN orders o ON o.customer_id = c.id',
  /ambiguous column name: id/
)
expectThrows('unknown function', 'SELECT MEDIAN(mrr) FROM customers', /no such function: MEDIAN/)
expectThrows('syntax error', 'SELECT FROM WHERE', /unexpected token|expected/)
expectThrows(
  'aggregate outside an aggregate context',
  'SELECT id FROM customers WHERE SUM(mrr) > 1',
  /misuse of aggregate function/
)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.log('\nFailures:')
  for (const failure of failures) console.log(`  - ${failure}`)
  process.exitCode = 1
}
