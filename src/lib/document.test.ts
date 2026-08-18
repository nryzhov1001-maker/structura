import { describe, expect, it } from 'vitest'
import { detectFormat, getDocumentStats, parseDocument, queryPath, serializeDocument } from './document'

describe('document utilities', () => {
  it('detects and converts JSON to YAML', () => {
    const source = '{"project":{"name":"Structura","stars":12}}'
    const parsed = parseDocument(source)

    expect(detectFormat(source)).toBe('json')
    expect(serializeDocument(parsed.data, 'yaml')).toContain('name: Structura')
  })

  it('parses YAML and resolves a JSON path', () => {
    const parsed = parseDocument('team:\n  - name: Ada\n  - name: Linus')
    expect(queryPath(parsed.data, '$.team[1].name')).toBe('Linus')
  })

  it('calculates structural statistics', () => {
    const data = { project: { tags: ['json', 'yaml'] }, public: true }
    expect(getDocumentStats(data, JSON.stringify(data))).toMatchObject({ keys: 3, arrays: 1, depth: 3 })
  })

  it('reports missing paths', () => {
    expect(() => queryPath({ ok: true }, '$.missing')).toThrow('No value')
  })
})
