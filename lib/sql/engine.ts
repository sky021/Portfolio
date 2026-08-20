/**
 * A small but genuine SQL engine: tokenizer, recursive-descent parser, and
 * evaluator for a practical SELECT subset.
 *
 * This exists so the NL2SQL demo executes queries for real in the browser
 * instead of replaying canned result sets. Supported surface:
 *
 *   SELECT [DISTINCT] items
 *   FROM table [alias]
 *   [INNER|LEFT] JOIN table [alias] ON condition
 *   WHERE condition
 *   GROUP BY exprs
 *   HAVING condition
 *   ORDER BY expr [ASC|DESC]
 *   LIMIT n
 *
 * Expressions cover comparison and arithmetic operators, AND/OR/NOT, LIKE, IN,
 * BETWEEN, IS [NOT] NULL, and the COUNT/SUM/AVG/MIN/MAX aggregates plus a few
 * scalar functions. Errors mirror SQLite's phrasing so the agent demo's repair
 * loop reacts to messages a real database would produce.
 */

export type SqlValue = string | number | boolean | null

export class SqlError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SqlError'
  }
}

/* ------------------------------------------------------------------ tokenizer */

type TokenType = 'ident' | 'number' | 'string' | 'punct' | 'keyword' | 'eof'

interface Token {
  type: TokenType
  value: string
  start: number
}

const KEYWORDS = new Set([
  'SELECT',
  'DISTINCT',
  'FROM',
  'WHERE',
  'GROUP',
  'BY',
  'HAVING',
  'ORDER',
  'LIMIT',
  'OFFSET',
  'JOIN',
  'INNER',
  'LEFT',
  'OUTER',
  'ON',
  'AS',
  'AND',
  'OR',
  'NOT',
  'NULL',
  'IS',
  'IN',
  'LIKE',
  'BETWEEN',
  'ASC',
  'DESC',
  'TRUE',
  'FALSE',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
])

const TWO_CHAR_OPS = new Set(['!=', '<>', '<=', '>=', '||'])

function tokenize(sql: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < sql.length) {
    const ch = sql[i]

    if (/\s/.test(ch)) {
      i += 1
      continue
    }

    // Line comment.
    if (ch === '-' && sql[i + 1] === '-') {
      while (i < sql.length && sql[i] !== '\n') i += 1
      continue
    }

    // Block comment.
    if (ch === '/' && sql[i + 1] === '*') {
      const close = sql.indexOf('*/', i + 2)
      i = close === -1 ? sql.length : close + 2
      continue
    }

    // Single-quoted string literal; '' is an escaped quote.
    if (ch === "'") {
      const start = i
      i += 1
      let value = ''
      while (i < sql.length) {
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") {
            value += "'"
            i += 2
            continue
          }
          break
        }
        value += sql[i]
        i += 1
      }
      if (i >= sql.length) throw new SqlError('unterminated string literal')
      i += 1
      tokens.push({ type: 'string', value, start })
      continue
    }

    // Double-quoted identifier.
    if (ch === '"') {
      const start = i
      i += 1
      let value = ''
      while (i < sql.length && sql[i] !== '"') {
        value += sql[i]
        i += 1
      }
      if (i >= sql.length) throw new SqlError('unterminated quoted identifier')
      i += 1
      tokens.push({ type: 'ident', value, start })
      continue
    }

    if (/[0-9]/.test(ch)) {
      const start = i
      let value = ''
      while (i < sql.length && /[0-9.]/.test(sql[i])) {
        value += sql[i]
        i += 1
      }
      tokens.push({ type: 'number', value, start })
      continue
    }

    if (/[A-Za-z_]/.test(ch)) {
      const start = i
      let value = ''
      while (i < sql.length && /[A-Za-z0-9_]/.test(sql[i])) {
        value += sql[i]
        i += 1
      }
      const upper = value.toUpperCase()
      tokens.push(
        KEYWORDS.has(upper)
          ? { type: 'keyword', value: upper, start }
          : { type: 'ident', value, start }
      )
      continue
    }

    const two = sql.slice(i, i + 2)
    if (TWO_CHAR_OPS.has(two)) {
      tokens.push({ type: 'punct', value: two, start: i })
      i += 2
      continue
    }

    if ('(),.*=<>+-/%'.includes(ch)) {
      tokens.push({ type: 'punct', value: ch, start: i })
      i += 1
      continue
    }

    throw new SqlError(`unrecognized token: "${ch}"`)
  }

  tokens.push({ type: 'eof', value: '', start: sql.length })
  return tokens
}

/* -------------------------------------------------------------------- ast */

export type Expr =
  | { kind: 'literal'; value: SqlValue }
  | { kind: 'column'; table?: string; name: string }
  | { kind: 'star'; table?: string }
  | { kind: 'binary'; op: string; left: Expr; right: Expr }
  | { kind: 'unary'; op: string; operand: Expr }
  | { kind: 'func'; name: string; args: Expr[]; distinct: boolean }
  | { kind: 'in'; operand: Expr; list: Expr[]; negated: boolean }
  | { kind: 'isNull'; operand: Expr; negated: boolean }
  | { kind: 'between'; operand: Expr; low: Expr; high: Expr; negated: boolean }
  | { kind: 'case'; whens: { when: Expr; then: Expr }[]; else?: Expr }

interface SelectItem {
  expr: Expr
  alias?: string
}

interface TableRef {
  table: string
  alias?: string
}

interface JoinClause extends TableRef {
  on: Expr
  type: 'inner' | 'left'
}

interface OrderItem {
  expr: Expr
  desc: boolean
}

interface SelectStatement {
  distinct: boolean
  items: SelectItem[]
  from?: TableRef
  joins: JoinClause[]
  where?: Expr
  groupBy: Expr[]
  having?: Expr
  orderBy: OrderItem[]
  limit?: number
}

const AGGREGATES = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'])
const SCALAR_FUNCS = new Set([
  'ROUND',
  'ABS',
  'COALESCE',
  'UPPER',
  'LOWER',
  'LENGTH',
  'IFNULL',
])

/* ------------------------------------------------------------------- parser */

class Parser {
  private tokens: Token[]
  private pos = 0

  constructor(sql: string) {
    this.tokens = tokenize(sql)
  }

  private peek(offset = 0): Token {
    return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)]
  }

  private next(): Token {
    const token = this.peek()
    if (token.type !== 'eof') this.pos += 1
    return token
  }

  private isKeyword(value: string, offset = 0): boolean {
    const token = this.peek(offset)
    return token.type === 'keyword' && token.value === value
  }

  private isPunct(value: string, offset = 0): boolean {
    const token = this.peek(offset)
    return token.type === 'punct' && token.value === value
  }

  private takeKeyword(value: string): boolean {
    if (this.isKeyword(value)) {
      this.pos += 1
      return true
    }
    return false
  }

  private takePunct(value: string): boolean {
    if (this.isPunct(value)) {
      this.pos += 1
      return true
    }
    return false
  }

  private expectKeyword(value: string) {
    if (!this.takeKeyword(value)) {
      throw new SqlError(`expected ${value} near "${this.peek().value || 'end of input'}"`)
    }
  }

  private expectPunct(value: string) {
    if (!this.takePunct(value)) {
      throw new SqlError(`expected "${value}" near "${this.peek().value || 'end of input'}"`)
    }
  }

  private expectIdent(): string {
    const token = this.peek()
    if (token.type !== 'ident') {
      throw new SqlError(`expected identifier near "${token.value || 'end of input'}"`)
    }
    this.pos += 1
    return token.value
  }

  parse(): SelectStatement {
    const statement = this.parseSelect()
    // Tolerate a trailing semicolon.
    this.takePunct(';')
    if (this.peek().type !== 'eof') {
      throw new SqlError(`unexpected token near "${this.peek().value}"`)
    }
    return statement
  }

  private parseSelect(): SelectStatement {
    this.expectKeyword('SELECT')
    const distinct = this.takeKeyword('DISTINCT')

    const items: SelectItem[] = []
    do {
      items.push(this.parseSelectItem())
    } while (this.takePunct(','))

    const statement: SelectStatement = {
      distinct,
      items,
      joins: [],
      groupBy: [],
      orderBy: [],
    }

    if (this.takeKeyword('FROM')) {
      statement.from = this.parseTableRef()

      for (;;) {
        let type: 'inner' | 'left' | null = null
        if (this.isKeyword('JOIN')) {
          type = 'inner'
          this.pos += 1
        } else if (this.isKeyword('INNER') && this.isKeyword('JOIN', 1)) {
          type = 'inner'
          this.pos += 2
        } else if (this.isKeyword('LEFT')) {
          // LEFT JOIN / LEFT OUTER JOIN
          let offset = 1
          if (this.isKeyword('OUTER', offset)) offset += 1
          if (this.isKeyword('JOIN', offset)) {
            type = 'left'
            this.pos += offset + 1
          }
        }

        if (!type) break

        const ref = this.parseTableRef()
        this.expectKeyword('ON')
        const on = this.parseExpr()
        statement.joins.push({ ...ref, on, type })
      }
    }

    if (this.takeKeyword('WHERE')) {
      statement.where = this.parseExpr()
    }

    if (this.takeKeyword('GROUP')) {
      this.expectKeyword('BY')
      do {
        statement.groupBy.push(this.parseExpr())
      } while (this.takePunct(','))
    }

    if (this.takeKeyword('HAVING')) {
      statement.having = this.parseExpr()
    }

    if (this.takeKeyword('ORDER')) {
      this.expectKeyword('BY')
      do {
        const expr = this.parseExpr()
        let desc = false
        if (this.takeKeyword('DESC')) desc = true
        else this.takeKeyword('ASC')
        statement.orderBy.push({ expr, desc })
      } while (this.takePunct(','))
    }

    if (this.takeKeyword('LIMIT')) {
      const token = this.next()
      if (token.type !== 'number') {
        throw new SqlError(`expected a number after LIMIT near "${token.value}"`)
      }
      statement.limit = Number(token.value)
    }

    return statement
  }

  private parseTableRef(): TableRef {
    const table = this.expectIdent()
    let alias: string | undefined

    if (this.takeKeyword('AS')) {
      alias = this.expectIdent()
    } else if (this.peek().type === 'ident') {
      alias = this.next().value
    }

    return { table, alias }
  }

  private parseSelectItem(): SelectItem {
    // Bare "*"
    if (this.isPunct('*')) {
      this.pos += 1
      return { expr: { kind: 'star' } }
    }

    // "alias.*"
    if (this.peek().type === 'ident' && this.isPunct('.', 1) && this.isPunct('*', 2)) {
      const table = this.next().value
      this.pos += 2
      return { expr: { kind: 'star', table } }
    }

    const expr = this.parseExpr()

    if (this.takeKeyword('AS')) {
      return { expr, alias: this.expectIdent() }
    }
    if (this.peek().type === 'ident') {
      return { expr, alias: this.next().value }
    }
    return { expr }
  }

  private parseExpr(): Expr {
    return this.parseOr()
  }

  private parseOr(): Expr {
    let left = this.parseAnd()
    while (this.takeKeyword('OR')) {
      left = { kind: 'binary', op: 'OR', left, right: this.parseAnd() }
    }
    return left
  }

  private parseAnd(): Expr {
    let left = this.parseNot()
    while (this.takeKeyword('AND')) {
      left = { kind: 'binary', op: 'AND', left, right: this.parseNot() }
    }
    return left
  }

  private parseNot(): Expr {
    if (this.takeKeyword('NOT')) {
      return { kind: 'unary', op: 'NOT', operand: this.parseNot() }
    }
    return this.parseComparison()
  }

  private parseComparison(): Expr {
    let left = this.parseAdditive()

    for (;;) {
      const token = this.peek()

      if (
        token.type === 'punct' &&
        ['=', '!=', '<>', '<', '<=', '>', '>='].includes(token.value)
      ) {
        this.pos += 1
        const op = token.value === '<>' ? '!=' : token.value
        left = { kind: 'binary', op, left, right: this.parseAdditive() }
        continue
      }

      if (this.isKeyword('IS')) {
        this.pos += 1
        const negated = this.takeKeyword('NOT')
        this.expectKeyword('NULL')
        left = { kind: 'isNull', operand: left, negated }
        continue
      }

      let negated = false
      if (this.isKeyword('NOT') && (this.isKeyword('IN', 1) || this.isKeyword('LIKE', 1) || this.isKeyword('BETWEEN', 1))) {
        negated = true
        this.pos += 1
      }

      if (this.isKeyword('IN')) {
        this.pos += 1
        this.expectPunct('(')
        const list: Expr[] = []
        if (!this.isPunct(')')) {
          do {
            list.push(this.parseExpr())
          } while (this.takePunct(','))
        }
        this.expectPunct(')')
        left = { kind: 'in', operand: left, list, negated }
        continue
      }

      if (this.isKeyword('LIKE')) {
        this.pos += 1
        const right = this.parseAdditive()
        const like: Expr = { kind: 'binary', op: 'LIKE', left, right }
        left = negated ? { kind: 'unary', op: 'NOT', operand: like } : like
        continue
      }

      if (this.isKeyword('BETWEEN')) {
        this.pos += 1
        const low = this.parseAdditive()
        this.expectKeyword('AND')
        const high = this.parseAdditive()
        left = { kind: 'between', operand: left, low, high, negated }
        continue
      }

      if (negated) {
        throw new SqlError('expected IN, LIKE, or BETWEEN after NOT')
      }

      break
    }

    return left
  }

  private parseAdditive(): Expr {
    let left = this.parseMultiplicative()
    for (;;) {
      if (this.isPunct('+') || this.isPunct('-') || this.isPunct('||')) {
        const op = this.next().value
        left = { kind: 'binary', op, left, right: this.parseMultiplicative() }
        continue
      }
      break
    }
    return left
  }

  private parseMultiplicative(): Expr {
    let left = this.parseUnary()
    for (;;) {
      if (this.isPunct('*') || this.isPunct('/') || this.isPunct('%')) {
        const op = this.next().value
        left = { kind: 'binary', op, left, right: this.parseUnary() }
        continue
      }
      break
    }
    return left
  }

  private parseUnary(): Expr {
    if (this.isPunct('-')) {
      this.pos += 1
      return { kind: 'unary', op: '-', operand: this.parseUnary() }
    }
    return this.parsePrimary()
  }

  private parsePrimary(): Expr {
    const token = this.peek()

    if (token.type === 'number') {
      this.pos += 1
      return { kind: 'literal', value: Number(token.value) }
    }

    if (token.type === 'string') {
      this.pos += 1
      return { kind: 'literal', value: token.value }
    }

    if (token.type === 'keyword') {
      if (token.value === 'NULL') {
        this.pos += 1
        return { kind: 'literal', value: null }
      }
      if (token.value === 'TRUE' || token.value === 'FALSE') {
        this.pos += 1
        return { kind: 'literal', value: token.value === 'TRUE' }
      }
      if (token.value === 'CASE') {
        return this.parseCase()
      }
    }

    if (this.isPunct('(')) {
      this.pos += 1
      const expr = this.parseExpr()
      this.expectPunct(')')
      return expr
    }

    if (token.type === 'ident') {
      // Function call.
      if (this.isPunct('(', 1)) {
        const name = this.next().value.toUpperCase()
        this.pos += 1 // consume "("

        if (!AGGREGATES.has(name) && !SCALAR_FUNCS.has(name)) {
          throw new SqlError(`no such function: ${name}`)
        }

        const distinct = this.takeKeyword('DISTINCT')
        const args: Expr[] = []

        if (this.isPunct('*')) {
          this.pos += 1
          args.push({ kind: 'star' })
        } else if (!this.isPunct(')')) {
          do {
            args.push(this.parseExpr())
          } while (this.takePunct(','))
        }

        this.expectPunct(')')
        return { kind: 'func', name, args, distinct }
      }

      // Qualified column reference.
      if (this.isPunct('.', 1)) {
        const table = this.next().value
        this.pos += 1 // consume "."
        const name = this.expectIdent()
        return { kind: 'column', table, name }
      }

      this.pos += 1
      return { kind: 'column', name: token.value }
    }

    throw new SqlError(`unexpected token near "${token.value || 'end of input'}"`)
  }

  private parseCase(): Expr {
    this.expectKeyword('CASE')
    const whens: { when: Expr; then: Expr }[] = []

    while (this.takeKeyword('WHEN')) {
      const when = this.parseExpr()
      this.expectKeyword('THEN')
      whens.push({ when, then: this.parseExpr() })
    }

    let elseExpr: Expr | undefined
    if (this.takeKeyword('ELSE')) {
      elseExpr = this.parseExpr()
    }

    this.expectKeyword('END')

    if (whens.length === 0) throw new SqlError('CASE requires at least one WHEN branch')
    return { kind: 'case', whens, else: elseExpr }
  }
}

/* ---------------------------------------------------------------- database */

export interface ColumnDef {
  name: string
  type: 'text' | 'integer' | 'real' | 'date'
  description?: string
}

export interface Table {
  name: string
  columns: ColumnDef[]
  rows: Record<string, SqlValue>[]
  description?: string
}

export interface Database {
  tables: Table[]
}

export interface QueryResult {
  columns: string[]
  rows: SqlValue[][]
  /** Number of source rows scanned before grouping, useful as a demo readout. */
  scanned: number
  elapsedMs: number
}

/* --------------------------------------------------------------- evaluator */

/** A row of the joined result set: alias -> column -> value. */
type RowContext = Record<string, Record<string, SqlValue>>

interface EvalContext {
  row: RowContext
  group?: RowContext[]
}

function isTruthy(value: SqlValue): boolean {
  if (value === null) return false
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  return value.length > 0
}

function compareValues(a: SqlValue, b: SqlValue): number {
  if (a === null && b === null) return 0
  if (a === null) return -1
  if (b === null) return 1

  if (typeof a === 'number' && typeof b === 'number') return a - b

  const as = typeof a === 'boolean' ? (a ? 1 : 0) : a
  const bs = typeof b === 'boolean' ? (b ? 1 : 0) : b

  if (typeof as === 'number' && typeof bs === 'number') return as - bs

  return String(as) < String(bs) ? -1 : String(as) > String(bs) ? 1 : 0
}

function toNumber(value: SqlValue): number | null {
  if (value === null) return null
  if (typeof value === 'number') return value
  if (typeof value === 'boolean') return value ? 1 : 0
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function likeToRegExp(pattern: string): RegExp {
  let out = ''
  for (const ch of pattern) {
    if (ch === '%') out += '.*'
    else if (ch === '_') out += '.'
    else out += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  return new RegExp(`^${out}$`, 'i')
}

function resolveColumn(expr: { table?: string; name: string }, row: RowContext): SqlValue {
  if (expr.table) {
    const table = row[expr.table]
    if (!table) throw new SqlError(`no such table alias: ${expr.table}`)
    if (!(expr.name in table)) {
      throw new SqlError(`no such column: ${expr.table}.${expr.name}`)
    }
    return table[expr.name]
  }

  const matches: SqlValue[] = []
  for (const alias of Object.keys(row)) {
    if (expr.name in row[alias]) matches.push(row[alias][expr.name])
  }

  if (matches.length === 0) throw new SqlError(`no such column: ${expr.name}`)
  if (matches.length > 1) throw new SqlError(`ambiguous column name: ${expr.name}`)
  return matches[0]
}

function containsAggregate(expr: Expr): boolean {
  switch (expr.kind) {
    case 'func':
      return AGGREGATES.has(expr.name) || expr.args.some(containsAggregate)
    case 'binary':
      return containsAggregate(expr.left) || containsAggregate(expr.right)
    case 'unary':
      return containsAggregate(expr.operand)
    case 'in':
      return containsAggregate(expr.operand) || expr.list.some(containsAggregate)
    case 'isNull':
      return containsAggregate(expr.operand)
    case 'between':
      return (
        containsAggregate(expr.operand) ||
        containsAggregate(expr.low) ||
        containsAggregate(expr.high)
      )
    case 'case':
      return (
        expr.whens.some((branch) => containsAggregate(branch.when) || containsAggregate(branch.then)) ||
        (expr.else ? containsAggregate(expr.else) : false)
      )
    default:
      return false
  }
}

/** Depth-first walk over an expression tree. */
function walkExpr(expr: Expr, visit: (node: Expr) => void): void {
  visit(expr)

  switch (expr.kind) {
    case 'binary':
      walkExpr(expr.left, visit)
      walkExpr(expr.right, visit)
      break
    case 'unary':
      walkExpr(expr.operand, visit)
      break
    case 'func':
      for (const arg of expr.args) walkExpr(arg, visit)
      break
    case 'in':
      walkExpr(expr.operand, visit)
      for (const item of expr.list) walkExpr(item, visit)
      break
    case 'isNull':
      walkExpr(expr.operand, visit)
      break
    case 'between':
      walkExpr(expr.operand, visit)
      walkExpr(expr.low, visit)
      walkExpr(expr.high, visit)
      break
    case 'case':
      for (const branch of expr.whens) {
        walkExpr(branch.when, visit)
        walkExpr(branch.then, visit)
      }
      if (expr.else) walkExpr(expr.else, visit)
      break
    default:
      break
  }
}

/**
 * Replaces unqualified column references that name an output alias with the
 * expression behind that alias.
 *
 * This is what lets GROUP BY, HAVING, and ORDER BY refer to a computed column by
 * its alias, the way SQLite and Postgres allow. The replacement is deliberately
 * not re-walked, so `SELECT mrr AS mrr` cannot recurse forever.
 */
function substituteAliases(expr: Expr, aliases: Map<string, Expr>): Expr {
  if (expr.kind === 'column' && !expr.table) {
    return aliases.get(expr.name.toLowerCase()) ?? expr
  }

  switch (expr.kind) {
    case 'binary':
      return {
        ...expr,
        left: substituteAliases(expr.left, aliases),
        right: substituteAliases(expr.right, aliases),
      }
    case 'unary':
      return { ...expr, operand: substituteAliases(expr.operand, aliases) }
    case 'func':
      return { ...expr, args: expr.args.map((arg) => substituteAliases(arg, aliases)) }
    case 'in':
      return {
        ...expr,
        operand: substituteAliases(expr.operand, aliases),
        list: expr.list.map((item) => substituteAliases(item, aliases)),
      }
    case 'isNull':
      return { ...expr, operand: substituteAliases(expr.operand, aliases) }
    case 'between':
      return {
        ...expr,
        operand: substituteAliases(expr.operand, aliases),
        low: substituteAliases(expr.low, aliases),
        high: substituteAliases(expr.high, aliases),
      }
    case 'case':
      return {
        ...expr,
        whens: expr.whens.map((branch) => ({
          when: substituteAliases(branch.when, aliases),
          then: substituteAliases(branch.then, aliases),
        })),
        else: expr.else ? substituteAliases(expr.else, aliases) : undefined,
      }
    default:
      return expr
  }
}

function evalAggregate(expr: Extract<Expr, { kind: 'func' }>, group: RowContext[]): SqlValue {
  const arg = expr.args[0]

  if (expr.name === 'COUNT') {
    if (!arg || arg.kind === 'star') return group.length

    const values = group
      .map((row) => evalExpr(arg, { row }))
      .filter((value) => value !== null)

    if (!expr.distinct) return values.length
    return new Set(values.map((value) => JSON.stringify(value))).size
  }

  if (!arg) throw new SqlError(`${expr.name} requires an argument`)

  let values = group.map((row) => evalExpr(arg, { row })).filter((value) => value !== null)

  if (expr.distinct) {
    const seen = new Set<string>()
    values = values.filter((value) => {
      const key = JSON.stringify(value)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  if (values.length === 0) return null

  switch (expr.name) {
    case 'SUM': {
      let sum = 0
      for (const value of values) {
        const num = toNumber(value)
        if (num !== null) sum += num
      }
      return sum
    }
    case 'AVG': {
      const numbers = values.map(toNumber).filter((n): n is number => n !== null)
      if (numbers.length === 0) return null
      return numbers.reduce((a, b) => a + b, 0) / numbers.length
    }
    case 'MIN':
      return values.reduce((best, value) => (compareValues(value, best) < 0 ? value : best))
    case 'MAX':
      return values.reduce((best, value) => (compareValues(value, best) > 0 ? value : best))
    default:
      throw new SqlError(`no such aggregate: ${expr.name}`)
  }
}

function evalExpr(expr: Expr, ctx: EvalContext): SqlValue {
  switch (expr.kind) {
    case 'literal':
      return expr.value

    case 'column':
      return resolveColumn(expr, ctx.row)

    case 'star':
      throw new SqlError('"*" is not valid in this position')

    case 'func': {
      if (AGGREGATES.has(expr.name)) {
        if (!ctx.group) {
          throw new SqlError(`misuse of aggregate function ${expr.name}()`)
        }
        return evalAggregate(expr, ctx.group)
      }

      const args = expr.args.map((arg) => evalExpr(arg, ctx))

      switch (expr.name) {
        case 'ROUND': {
          const value = toNumber(args[0])
          if (value === null) return null
          const digits = args.length > 1 ? toNumber(args[1]) ?? 0 : 0
          const factor = Math.pow(10, digits)
          return Math.round(value * factor) / factor
        }
        case 'ABS': {
          const value = toNumber(args[0])
          return value === null ? null : Math.abs(value)
        }
        case 'COALESCE':
        case 'IFNULL': {
          for (const arg of args) if (arg !== null) return arg
          return null
        }
        case 'UPPER':
          return args[0] === null ? null : String(args[0]).toUpperCase()
        case 'LOWER':
          return args[0] === null ? null : String(args[0]).toLowerCase()
        case 'LENGTH':
          return args[0] === null ? null : String(args[0]).length
        default:
          throw new SqlError(`no such function: ${expr.name}`)
      }
    }

    case 'unary': {
      if (expr.op === 'NOT') {
        const value = evalExpr(expr.operand, ctx)
        return value === null ? null : !isTruthy(value)
      }
      const value = toNumber(evalExpr(expr.operand, ctx))
      return value === null ? null : -value
    }

    case 'binary': {
      if (expr.op === 'AND') {
        const left = evalExpr(expr.left, ctx)
        if (left !== null && !isTruthy(left)) return false
        const right = evalExpr(expr.right, ctx)
        if (left === null || right === null) return null
        return isTruthy(left) && isTruthy(right)
      }

      if (expr.op === 'OR') {
        const left = evalExpr(expr.left, ctx)
        if (left !== null && isTruthy(left)) return true
        const right = evalExpr(expr.right, ctx)
        if (left === null || right === null) return null
        return isTruthy(left) || isTruthy(right)
      }

      const left = evalExpr(expr.left, ctx)
      const right = evalExpr(expr.right, ctx)

      if (expr.op === 'LIKE') {
        if (left === null || right === null) return null
        return likeToRegExp(String(right)).test(String(left))
      }

      if (expr.op === '||') {
        if (left === null || right === null) return null
        return String(left) + String(right)
      }

      if (['=', '!=', '<', '<=', '>', '>='].includes(expr.op)) {
        if (left === null || right === null) return null
        const cmp = compareValues(left, right)
        switch (expr.op) {
          case '=':
            return cmp === 0
          case '!=':
            return cmp !== 0
          case '<':
            return cmp < 0
          case '<=':
            return cmp <= 0
          case '>':
            return cmp > 0
          default:
            return cmp >= 0
        }
      }

      const ln = toNumber(left)
      const rn = toNumber(right)
      if (ln === null || rn === null) return null

      switch (expr.op) {
        case '+':
          return ln + rn
        case '-':
          return ln - rn
        case '*':
          return ln * rn
        case '/':
          return rn === 0 ? null : ln / rn
        case '%':
          return rn === 0 ? null : ln % rn
        default:
          throw new SqlError(`unsupported operator: ${expr.op}`)
      }
    }

    case 'in': {
      const value = evalExpr(expr.operand, ctx)
      if (value === null) return null
      let found = false
      for (const item of expr.list) {
        const candidate = evalExpr(item, ctx)
        if (candidate !== null && compareValues(value, candidate) === 0) {
          found = true
          break
        }
      }
      return expr.negated ? !found : found
    }

    case 'isNull': {
      const value = evalExpr(expr.operand, ctx)
      return expr.negated ? value !== null : value === null
    }

    case 'between': {
      const value = evalExpr(expr.operand, ctx)
      const low = evalExpr(expr.low, ctx)
      const high = evalExpr(expr.high, ctx)
      if (value === null || low === null || high === null) return null
      const within = compareValues(value, low) >= 0 && compareValues(value, high) <= 0
      return expr.negated ? !within : within
    }

    case 'case': {
      for (const branch of expr.whens) {
        if (isTruthy(evalExpr(branch.when, ctx) ?? false)) {
          return evalExpr(branch.then, ctx)
        }
      }
      return expr.else ? evalExpr(expr.else, ctx) : null
    }

    default:
      throw new SqlError('unsupported expression')
  }
}

/** Derives an output column name the way a database would. */
function columnName(item: SelectItem): string {
  if (item.alias) return item.alias
  const expr = item.expr
  if (expr.kind === 'column') return expr.name
  if (expr.kind === 'func') {
    const inner = expr.args
      .map((arg) => (arg.kind === 'star' ? '*' : arg.kind === 'column' ? arg.name : '?'))
      .join(', ')
    return `${expr.name}(${expr.distinct ? 'DISTINCT ' : ''}${inner})`
  }
  return 'expr'
}

export function runQuery(sql: string, db: Database): QueryResult {
  const started =
    typeof performance !== 'undefined' ? performance.now() : Date.now()

  const statement = new Parser(sql).parse()

  const tableByName = new Map<string, Table>()
  for (const table of db.tables) tableByName.set(table.name.toLowerCase(), table)

  const requireTable = (name: string): Table => {
    const table = tableByName.get(name.toLowerCase())
    if (!table) throw new SqlError(`no such table: ${name}`)
    return table
  }

  // Resolve output-alias references in the clauses that are allowed to use them,
  // before anything is validated or evaluated.
  const aliasExprs = new Map<string, Expr>()
  for (const item of statement.items) {
    if (item.alias) aliasExprs.set(item.alias.toLowerCase(), item.expr)
  }

  if (aliasExprs.size > 0) {
    statement.groupBy = statement.groupBy.map((expr) => substituteAliases(expr, aliasExprs))
    if (statement.having) statement.having = substituteAliases(statement.having, aliasExprs)
    statement.orderBy = statement.orderBy.map((term) => ({
      ...term,
      expr: substituteAliases(term.expr, aliasExprs),
    }))
  }

  // Validation pass: every column reference is resolved against the schema
  // before a single row is scanned. Doing this up front means a bad column fails
  // deterministically rather than only when evaluation happens to reach it.
  const aliasColumns = new Map<string, Set<string>>()

  const registerRef = (ref: TableRef) => {
    const table = requireTable(ref.table)
    const alias = ref.alias ?? ref.table
    aliasColumns.set(alias, new Set(table.columns.map((column) => column.name)))
  }

  if (statement.from) registerRef(statement.from)
  for (const join of statement.joins) registerRef(join)

  const selectAliases = new Set(
    statement.items
      .filter((item): item is SelectItem & { alias: string } => Boolean(item.alias))
      .map((item) => item.alias.toLowerCase())
  )

  const validateExpr = (expr: Expr, allowSelectAlias: boolean) => {
    walkExpr(expr, (node) => {
      if (node.kind !== 'column') return

      if (node.table) {
        const columns = aliasColumns.get(node.table)
        if (!columns) throw new SqlError(`no such table alias: ${node.table}`)
        if (!columns.has(node.name)) {
          throw new SqlError(`no such column: ${node.table}.${node.name}`)
        }
        return
      }

      // GROUP BY, HAVING, and ORDER BY may reference an output alias.
      if (allowSelectAlias && selectAliases.has(node.name.toLowerCase())) return

      let matches = 0
      for (const columns of aliasColumns.values()) {
        if (columns.has(node.name)) matches += 1
      }
      if (matches === 0) throw new SqlError(`no such column: ${node.name}`)
      if (matches > 1) throw new SqlError(`ambiguous column name: ${node.name}`)
    })
  }

  for (const item of statement.items) {
    if (item.expr.kind !== 'star') validateExpr(item.expr, false)
  }
  for (const join of statement.joins) validateExpr(join.on, false)
  if (statement.where) validateExpr(statement.where, false)
  for (const expr of statement.groupBy) validateExpr(expr, true)
  if (statement.having) validateExpr(statement.having, true)
  for (const term of statement.orderBy) validateExpr(term.expr, true)

  // Build the joined row set.
  let rows: RowContext[] = [{}]
  let scanned = 0

  if (statement.from) {
    const base = requireTable(statement.from.table)
    const baseAlias = statement.from.alias ?? statement.from.table
    scanned += base.rows.length
    rows = base.rows.map((row) => ({ [baseAlias]: row }))
  }

  for (const join of statement.joins) {
    const table = requireTable(join.table)
    const alias = join.alias ?? join.table
    scanned += table.rows.length

    const nullRow: Record<string, SqlValue> = {}
    for (const column of table.columns) nullRow[column.name] = null

    const joined: RowContext[] = []

    for (const left of rows) {
      let matched = false
      for (const right of table.rows) {
        const candidate: RowContext = { ...left, [alias]: right }
        if (isTruthy(evalExpr(join.on, { row: candidate }) ?? false)) {
          joined.push(candidate)
          matched = true
        }
      }
      if (!matched && join.type === 'left') {
        joined.push({ ...left, [alias]: nullRow })
      }
    }

    rows = joined
  }

  if (statement.where) {
    rows = rows.filter((row) => isTruthy(evalExpr(statement.where as Expr, { row }) ?? false))
  }

  // Expand "*" and "alias.*" into concrete select items.
  const expanded: SelectItem[] = []
  for (const item of statement.items) {
    if (item.expr.kind !== 'star') {
      expanded.push(item)
      continue
    }

    const starTable = item.expr.table
    const refs: TableRef[] = []
    if (statement.from) refs.push(statement.from)
    for (const join of statement.joins) refs.push(join)

    for (const ref of refs) {
      const alias = ref.alias ?? ref.table
      if (starTable && starTable !== alias) continue
      const table = requireTable(ref.table)
      for (const column of table.columns) {
        expanded.push({
          expr: { kind: 'column', table: alias, name: column.name },
          alias: starTable || refs.length === 1 ? column.name : `${alias}.${column.name}`,
        })
      }
    }

    if (expanded.length === 0) throw new SqlError('"*" has no columns to expand')
  }

  const aggregated =
    statement.groupBy.length > 0 ||
    expanded.some((item) => containsAggregate(item.expr)) ||
    (statement.having ? containsAggregate(statement.having) : false)

  type OutputRow = { values: SqlValue[]; aliases: Map<string, SqlValue>; ctx: EvalContext }
  const output: OutputRow[] = []

  const buildRow = (ctx: EvalContext): OutputRow => {
    const values: SqlValue[] = []
    const aliases = new Map<string, SqlValue>()
    expanded.forEach((item, index) => {
      const value = evalExpr(item.expr, ctx)
      values.push(value)
      aliases.set(columnName(item).toLowerCase(), value)
      aliases.set(String(index + 1), value)
    })
    return { values, aliases, ctx }
  }

  if (aggregated) {
    const groups = new Map<string, RowContext[]>()

    if (statement.groupBy.length === 0) {
      // Aggregate over everything as a single group; an empty table still
      // produces one row, matching SQL semantics for COUNT(*).
      groups.set('__all__', rows)
    } else {
      for (const row of rows) {
        const key = JSON.stringify(
          statement.groupBy.map((expr) => evalExpr(expr, { row }))
        )
        const bucket = groups.get(key)
        if (bucket) bucket.push(row)
        else groups.set(key, [row])
      }
    }

    for (const group of groups.values()) {
      // Non-aggregate expressions resolve against the first row of the group,
      // which is well defined because they are the grouping keys.
      const ctx: EvalContext = { row: group[0] ?? {}, group }

      if (statement.having) {
        if (!isTruthy(evalExpr(statement.having, ctx) ?? false)) continue
      }

      output.push(buildRow(ctx))
    }
  } else {
    for (const row of rows) {
      output.push(buildRow({ row }))
    }
  }

  // ORDER BY resolves output aliases and ordinals first, then falls back to
  // evaluating against the row context.
  let ordered = output
  if (statement.orderBy.length > 0) {
    const keyFor = (row: OutputRow, expr: Expr): SqlValue => {
      if (expr.kind === 'column' && !expr.table) {
        const alias = row.aliases.get(expr.name.toLowerCase())
        if (alias !== undefined) return alias
      }
      if (expr.kind === 'literal' && typeof expr.value === 'number') {
        const ordinal = row.aliases.get(String(expr.value))
        if (ordinal !== undefined) return ordinal
      }
      return evalExpr(expr, row.ctx)
    }

    ordered = [...output].sort((a, b) => {
      for (const term of statement.orderBy) {
        const cmp = compareValues(keyFor(a, term.expr), keyFor(b, term.expr))
        if (cmp !== 0) return term.desc ? -cmp : cmp
      }
      return 0
    })
  }

  let finalRows = ordered.map((row) => row.values)

  if (statement.distinct) {
    const seen = new Set<string>()
    finalRows = finalRows.filter((values) => {
      const key = JSON.stringify(values)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  if (statement.limit !== undefined) {
    finalRows = finalRows.slice(0, statement.limit)
  }

  const elapsed =
    (typeof performance !== 'undefined' ? performance.now() : Date.now()) - started

  return {
    columns: expanded.map(columnName),
    rows: finalRows,
    scanned,
    elapsedMs: elapsed,
  }
}
