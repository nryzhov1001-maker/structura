import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

export type DataFormat = 'json' | 'yaml'
export type InputFormat = DataFormat | 'auto'

export type ParsedDocument = {
  data: unknown
  format: DataFormat
}

export type DocumentStats = {
  nodes: number
  keys: number
  arrays: number
  depth: number
  bytes: number
}

export function detectFormat(source: string): DataFormat {
  const trimmed = source.trim()
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json'
  return 'yaml'
}

export function parseDocument(source: string, requested: InputFormat = 'auto'): ParsedDocument {
  if (!source.trim()) throw new Error('The document is empty')

  const format = requested === 'auto' ? detectFormat(source) : requested

  try {
    return {
      data: format === 'json' ? JSON.parse(source) : parseYaml(source),
      format,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parsing error'
    throw new Error(cleanError(message, format))
  }
}

function cleanError(message: string, format: DataFormat) {
  const firstLine = message.split('\n')[0]
  return `${format.toUpperCase()} · ${firstLine}`
}

export function serializeDocument(data: unknown, format: DataFormat, compact = false): string {
  if (format === 'json') return JSON.stringify(data, null, compact ? 0 : 2)
  return stringifyYaml(data, { indent: 2, lineWidth: 0 }).trimEnd()
}

export function formatDocument(source: string, format: InputFormat = 'auto'): string {
  const parsed = parseDocument(source, format)
  return serializeDocument(parsed.data, parsed.format)
}

export function getDocumentStats(data: unknown, source: string): DocumentStats {
  let nodes = 0
  let keys = 0
  let arrays = 0
  let maxDepth = 0

  function visit(value: unknown, depth: number) {
    nodes += 1
    maxDepth = Math.max(maxDepth, depth)

    if (Array.isArray(value)) {
      arrays += 1
      value.forEach((item) => visit(item, depth + 1))
      return
    }

    if (value !== null && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>)
      keys += entries.length
      entries.forEach(([, child]) => visit(child, depth + 1))
    }
  }

  visit(data, 0)
  return { nodes, keys, arrays, depth: maxDepth, bytes: new TextEncoder().encode(source).length }
}

export function queryPath(data: unknown, path: string): unknown {
  const input = path.trim()
  if (!input || input === '$') return data
  if (!input.startsWith('$')) throw new Error('Path must start with $')

  const tokens: Array<string | number> = []
  const expression = input.slice(1)
  const matcher = /\.([A-Za-z_$][\w$-]*)|\[(\d+)\]|\[['"]([^'"]+)['"]\]/g
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = matcher.exec(expression)) !== null) {
    if (match.index !== cursor) throw new Error(`Unsupported path near “${expression.slice(cursor)}”`)
    tokens.push(match[1] ?? (match[2] !== undefined ? Number(match[2]) : match[3]))
    cursor = matcher.lastIndex
  }

  if (cursor !== expression.length) throw new Error(`Unsupported path near “${expression.slice(cursor)}”`)

  let value: unknown = data
  for (const token of tokens) {
    if (value === null || value === undefined || typeof value !== 'object') {
      throw new Error(`No value at ${path}`)
    }
    if (!(token in value)) throw new Error(`No value at ${path}`)
    value = (value as Record<string | number, unknown>)[token]
  }
  return value
}

export function describeValue(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return `${value.length} items`
  if (typeof value === 'object') return `${Object.keys(value as object).length} keys`
  if (typeof value === 'string') return `${value.length} chars`
  return typeof value
}
