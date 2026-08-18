import { readFile, writeFile } from 'node:fs/promises'
import { stdin, stdout, stderr } from 'node:process'
import { parseCliArgs, transformForCli } from './lib/cli'

const VERSION = '0.1.0'

const help = `Structura — local-first JSON and YAML toolkit

Usage:
  structura [file|-] [options]

Options:
  -f, --from <format>   Input format: auto, json or yaml (default: auto)
  -t, --to <format>     Output format: json or yaml
  -o, --output <file>   Write output to a file
  -q, --query <path>    Select a focused JSONPath such as $.users[0].name
  -c, --compact         Produce compact JSON
      --check           Validate input and print its detected format
      --stats           Print structural statistics as JSON
  -v, --version         Print the current version
  -h, --help            Show this help

Examples:
  structura config.json --to yaml
  cat config.yaml | structura --to json --compact
  structura data.json --query '$.users[0].name'
`

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of stdin) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

async function main() {
  const options = parseCliArgs(process.argv.slice(2))

  if (options.help || (!options.input && stdin.isTTY)) {
    stdout.write(help)
    return
  }

  if (options.version) {
    stdout.write(`${VERSION}\n`)
    return
  }

  const source = options.input && options.input !== '-' ? await readFile(options.input, 'utf8') : await readStdin()
  const result = transformForCli(source, options)

  if (options.output) await writeFile(options.output, `${result}\n`, 'utf8')
  else stdout.write(`${result}\n`)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  stderr.write(`Structura: ${message}\n`)
  process.exitCode = 1
})
