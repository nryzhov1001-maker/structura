import { describe, expect, it } from 'vitest'
import { parseCliArgs, transformForCli } from './cli'

describe('Structura CLI core', () => {
  it('parses conversion options', () => {
    expect(parseCliArgs(['config.json', '--to', 'yaml', '--output', 'config.yaml'])).toMatchObject({
      input: 'config.json',
      to: 'yaml',
      output: 'config.yaml',
    })
  })

  it('converts JSON to YAML', () => {
    const options = parseCliArgs(['-', '--to', 'yaml'])
    expect(transformForCli('{"project":"Structura"}', options)).toBe('project: Structura')
  })

  it('queries a value and returns valid JSON', () => {
    const options = parseCliArgs(['data.yaml', '--query', '$.users[0]', '--to', 'json'])
    expect(transformForCli('users:\n  - name: Ada', options)).toBe('{\n  "name": "Ada"\n}')
  })

  it('reports structural statistics', () => {
    const options = parseCliArgs(['-', '--stats'])
    expect(JSON.parse(transformForCli('{"items":[1,2]}', options))).toMatchObject({ arrays: 1, keys: 1 })
  })

  it('rejects incompatible modes', () => {
    expect(() => parseCliArgs(['--stats', '--check'])).toThrow('cannot be combined')
  })
})
