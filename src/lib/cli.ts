import {
  getDocumentStats,
  parseDocument,
  queryPath,
  serializeDocument,
  type DataFormat,
  type InputFormat,
} from './document'

export type CliOptions = {
  input?: string
  output?: string
  from: InputFormat
  to?: DataFormat
  compact: boolean
  query?: string
  stats: boolean
  check: boolean
  help: boolean
  version: boolean
}

const formats = new Set(['auto', 'json', 'yaml'])

export function parseCliArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    from: 'auto',
    compact: false,
    stats: false,
    check: false,
    help: false,
    version: false,
  }

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]

    if (argument === '--help' || argument === '-h') options.help = true
    else if (argument === '--version' || argument === '-v') options.version = true
    else if (argument === '--compact' || argument === '-c') options.compact = true
    else if (argument === '--stats') options.stats = true
    else if (argument === '--check') options.check = true
    else if (argument === '--from' || argument === '-f') {
      const value = args[++index]
      if (!formats.has(value)) throw new Error('--from expects auto, json or yaml')
      options.from = value as InputFormat
    } else if (argument === '--to' || argument === '-t') {
      const value = args[++index]
      if (value !== 'json' && value !== 'yaml') throw new Error('--to expects json or yaml')
      options.to = value
    } else if (argument === '--output' || argument === '-o') {
      options.output = requireValue(argument, args[++index])
    } else if (argument === '--query' || argument === '-q') {
      options.query = requireValue(argument, args[++index])
    } else if (argument.startsWith('-') && argument !== '-') {
      throw new Error(`Unknown option: ${argument}`)
    } else if (!options.input) options.input = argument
    else throw new Error(`Unexpected argument: ${argument}`)
  }

  const selectedModes = Number(options.stats) + Number(options.check)
  if (selectedModes > 1) throw new Error('--stats and --check cannot be combined')

  return options
}

function requireValue(option: string, value?: string): string {
  if (!value || value.startsWith('-')) throw new Error(`${option} expects a value`)
  return value
}

export function transformForCli(source: string, options: CliOptions): string {
  const parsed = parseDocument(source, options.from)

  if (options.check) return `Valid ${parsed.format.toUpperCase()}`
  if (options.stats) return JSON.stringify(getDocumentStats(parsed.data, source), null, 2)

  const data = options.query ? queryPath(parsed.data, options.query) : parsed.data
  const target = options.to ?? parsed.format
  return serializeDocument(data, target, options.compact)
}
