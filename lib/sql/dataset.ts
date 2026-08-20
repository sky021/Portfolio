import type { Database, SqlValue, Table } from './engine'

/**
 * Deterministic demo dataset.
 *
 * Rows are generated from a fixed seed rather than checked in as literals, so
 * the file stays small while every visitor sees identical results and any query
 * they run is reproducible.
 */

function makeRng(seed: number) {
  let state = seed >>> 0
  return () => {
    // Numerical Recipes LCG constants.
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

const rand = makeRng(20260818)

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)]
}

function pickWeighted<T>(items: readonly { value: T; weight: number }[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  let roll = rand() * total
  for (const item of items) {
    roll -= item.weight
    if (roll <= 0) return item.value
  }
  return items[items.length - 1].value
}

function intBetween(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/** Formats a day offset from 2025-01-01 as an ISO date string. */
function dateFromDayOffset(offset: number): string {
  const base = Date.UTC(2025, 0, 1)
  const date = new Date(base + offset * 86400000)
  return date.toISOString().slice(0, 10)
}

const REGIONS = ['North America', 'EMEA', 'APAC', 'LATAM'] as const
const PLANS = ['Free', 'Pro', 'Business', 'Enterprise'] as const
const PLAN_MRR: Record<string, number> = {
  Free: 0,
  Pro: 49,
  Business: 199,
  Enterprise: 1200,
}

const COMPANY_PREFIX = [
  'Northwind',
  'Blue Harbor',
  'Cedar',
  'Ironclad',
  'Lumen',
  'Vertex',
  'Copper',
  'Sable',
  'Meridian',
  'Quartz',
  'Beacon',
  'Trellis',
  'Halcyon',
  'Onyx',
  'Pinegrove',
  'Solstice',
  'Kestrel',
  'Foundry',
  'Brightline',
  'Arbor',
  'Silverpine',
  'Redstone',
  'Waypoint',
  'Northgate',
] as const

const COMPANY_SUFFIX = ['Labs', 'Systems', 'Group', 'Analytics', 'Works', 'Partners'] as const

const PRODUCT_CATALOG = [
  { name: 'Edge Gateway', category: 'Hardware', price: 1290 },
  { name: 'Sensor Array', category: 'Hardware', price: 640 },
  { name: 'Rack Controller', category: 'Hardware', price: 2150 },
  { name: 'Field Router', category: 'Hardware', price: 880 },
  { name: 'Analytics Suite', category: 'Software', price: 480 },
  { name: 'Pipeline Studio', category: 'Software', price: 720 },
  { name: 'Model Registry', category: 'Software', price: 360 },
  { name: 'Vision Toolkit', category: 'Software', price: 540 },
  { name: 'Stream Processor', category: 'Software', price: 950 },
  { name: 'Onboarding Package', category: 'Services', price: 3200 },
  { name: 'Migration Sprint', category: 'Services', price: 4800 },
  { name: 'Architecture Review', category: 'Services', price: 2600 },
  { name: 'Custom Integration', category: 'Services', price: 5400 },
  { name: 'Premium Support', category: 'Support', price: 1800 },
  { name: 'Standard Support', category: 'Support', price: 600 },
  { name: 'Training Credits', category: 'Support', price: 450 },
] as const

/* ------------------------------------------------------------------ builders */

const customerRows: Record<string, SqlValue>[] = []
const usedNames = new Set<string>()

for (let id = 1; id <= 48; id += 1) {
  let name = `${pick(COMPANY_PREFIX)} ${pick(COMPANY_SUFFIX)}`
  let guard = 0
  while (usedNames.has(name) && guard < 40) {
    name = `${pick(COMPANY_PREFIX)} ${pick(COMPANY_SUFFIX)}`
    guard += 1
  }
  usedNames.add(name)

  const plan = pickWeighted([
    { value: 'Free' as const, weight: 3 },
    { value: 'Pro' as const, weight: 4 },
    { value: 'Business' as const, weight: 3 },
    { value: 'Enterprise' as const, weight: 2 },
  ])

  // Enterprise contracts vary; smaller plans are list price.
  const mrr =
    plan === 'Enterprise'
      ? PLAN_MRR[plan] + intBetween(0, 9) * 150
      : PLAN_MRR[plan]

  customerRows.push({
    id,
    name,
    region: pick(REGIONS),
    plan,
    signup_date: dateFromDayOffset(intBetween(0, 300)),
    mrr,
  })
}

const productRows: Record<string, SqlValue>[] = PRODUCT_CATALOG.map((product, index) => ({
  id: index + 1,
  name: product.name,
  category: product.category,
  unit_price: product.price,
}))

const orderRows: Record<string, SqlValue>[] = []
const orderItemRows: Record<string, SqlValue>[] = []
let orderItemId = 1

for (let id = 1; id <= 190; id += 1) {
  const customerId = intBetween(1, customerRows.length)
  const status = pickWeighted([
    { value: 'completed' as const, weight: 7 },
    { value: 'pending' as const, weight: 2 },
    { value: 'refunded' as const, weight: 1 },
    { value: 'cancelled' as const, weight: 1 },
  ])

  const itemCount = intBetween(1, 4)
  let amount = 0

  for (let n = 0; n < itemCount; n += 1) {
    const productIndex = intBetween(0, productRows.length - 1)
    const product = productRows[productIndex]
    const quantity = intBetween(1, 6)
    const unitPrice = product.unit_price as number
    // Occasional negotiated discount keeps unit_price on the line item useful.
    const discounted = rand() < 0.25 ? round2(unitPrice * (0.85 + rand() * 0.1)) : unitPrice

    orderItemRows.push({
      id: orderItemId,
      order_id: id,
      product_id: product.id,
      quantity,
      unit_price: discounted,
    })
    orderItemId += 1
    amount += quantity * discounted
  }

  orderRows.push({
    id,
    customer_id: customerId,
    order_date: dateFromDayOffset(intBetween(0, 330)),
    status,
    amount: round2(amount),
  })
}

const ticketRows: Record<string, SqlValue>[] = []

for (let id = 1; id <= 140; id += 1) {
  const severity = pickWeighted([
    { value: 'low' as const, weight: 4 },
    { value: 'medium' as const, weight: 4 },
    { value: 'high' as const, weight: 2 },
    { value: 'critical' as const, weight: 1 },
  ])

  const status = pickWeighted([
    { value: 'resolved' as const, weight: 6 },
    { value: 'open' as const, weight: 2 },
    { value: 'escalated' as const, weight: 1 },
  ])

  // Higher severity resolves faster; unresolved tickets have no duration yet,
  // which exercises NULL handling in AVG and COUNT.
  const baseHours: Record<string, number> = { critical: 4, high: 12, medium: 30, low: 56 }
  const resolutionHours =
    status === 'resolved' ? round2(baseHours[severity] * (0.6 + rand() * 0.9)) : null

  ticketRows.push({
    id,
    customer_id: intBetween(1, customerRows.length),
    opened_date: dateFromDayOffset(intBetween(0, 330)),
    severity,
    status,
    resolution_hours: resolutionHours,
  })
}

/* -------------------------------------------------------------------- tables */

const tables: Table[] = [
  {
    name: 'customers',
    description: 'One row per customer account, including plan and billing region.',
    columns: [
      { name: 'id', type: 'integer', description: 'Primary key' },
      { name: 'name', type: 'text', description: 'Account name' },
      { name: 'region', type: 'text', description: 'North America, EMEA, APAC, LATAM' },
      { name: 'plan', type: 'text', description: 'Free, Pro, Business, Enterprise' },
      { name: 'signup_date', type: 'date', description: 'ISO date' },
      { name: 'mrr', type: 'real', description: 'Monthly recurring revenue in USD' },
    ],
    rows: customerRows,
  },
  {
    name: 'orders',
    description: 'Purchase orders placed by customers, with a denormalized total.',
    columns: [
      { name: 'id', type: 'integer', description: 'Primary key' },
      { name: 'customer_id', type: 'integer', description: 'References customers.id' },
      { name: 'order_date', type: 'date', description: 'ISO date' },
      { name: 'status', type: 'text', description: 'completed, pending, refunded, cancelled' },
      { name: 'amount', type: 'real', description: 'Order total in USD' },
    ],
    rows: orderRows,
  },
  {
    name: 'order_items',
    description: 'Line items belonging to an order.',
    columns: [
      { name: 'id', type: 'integer', description: 'Primary key' },
      { name: 'order_id', type: 'integer', description: 'References orders.id' },
      { name: 'product_id', type: 'integer', description: 'References products.id' },
      { name: 'quantity', type: 'integer', description: 'Units purchased' },
      { name: 'unit_price', type: 'real', description: 'Price actually charged per unit' },
    ],
    rows: orderItemRows,
  },
  {
    name: 'products',
    description: 'Product catalog with list pricing.',
    columns: [
      { name: 'id', type: 'integer', description: 'Primary key' },
      { name: 'name', type: 'text', description: 'Product name' },
      { name: 'category', type: 'text', description: 'Hardware, Software, Services, Support' },
      { name: 'unit_price', type: 'real', description: 'List price in USD' },
    ],
    rows: productRows,
  },
  {
    name: 'support_tickets',
    description: 'Support requests raised by customers and their resolution time.',
    columns: [
      { name: 'id', type: 'integer', description: 'Primary key' },
      { name: 'customer_id', type: 'integer', description: 'References customers.id' },
      { name: 'opened_date', type: 'date', description: 'ISO date' },
      { name: 'severity', type: 'text', description: 'low, medium, high, critical' },
      { name: 'status', type: 'text', description: 'open, resolved, escalated' },
      {
        name: 'resolution_hours',
        type: 'real',
        description: 'Hours to resolution; NULL while unresolved',
      },
    ],
    rows: ticketRows,
  },
]

export const demoDatabase: Database = { tables }

/** Rendered in the demo as the corpus that schema retrieval searches over. */
export const schemaChunks = tables.map((table) => ({
  table: table.name,
  description: table.description ?? '',
  columns: table.columns.map((column) => `${column.name} ${column.type}`),
  rowCount: table.rows.length,
}))

export const datasetSummary = {
  tableCount: tables.length,
  rowCount: tables.reduce((sum, table) => sum + table.rows.length, 0),
}
