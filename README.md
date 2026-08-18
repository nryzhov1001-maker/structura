# Structura

**A private, local-first workbench for JSON and YAML.**

Structura converts, formats, validates and explores structured documents entirely inside the browser. There is no account, backend, telemetry or document upload.

**Live app:** [nryzhov1001-maker.github.io/structura](https://nryzhov1001-maker.github.io/structura/)

**npm package:** `structura-workbench` · **CLI command:** `structura`

> Project status: **functional early MVP.** The transform engine, workbench, tree explorer, file import/export and path query are usable today. Schema tooling and large-file workers are planned.

## What works

- Automatic JSON/YAML detection
- Lossless data-model conversion between JSON and YAML
- Pretty formatting and compact JSON output
- Clear parser errors and live validity status
- Structural metrics: nodes, keys, arrays, depth and byte size
- Expandable object and array tree
- Focused JSONPath queries such as `$.users[0].name`
- Local file import, clipboard copy and output download
- Responsive, keyboard-friendly interface
- Deterministic TypeScript core with unit tests
- Reusable Node.js API and stdin/stdout-friendly CLI

## Privacy model

Documents are parsed in the current browser tab. Structura does not send document contents to a server and does not include analytics. File import uses the browser `FileReader` API; downloads are generated locally with a `Blob` URL.

## Quick start

### Command line

Run without installing:

```bash
npx structura-workbench config.json --to yaml
```

Or install the `structura` command globally:

```bash
npm install --global structura-workbench
structura config.yaml --to json --compact
```

It also works in pipelines and can validate, inspect or query documents:

```bash
cat config.yaml | structura --to json
structura package.json --check
structura data.yaml --stats
structura data.json --query '$.users[0].name'
```

Use `structura --help` for the complete option list.

### Web app development

Requires Node.js 20 or newer.

```bash
git clone https://github.com/nryzhov1001-maker/structura.git
cd structura
npm install
npm run dev
```

Open `http://localhost:4174`.

```bash
npm test
npm run build
```

## Core API

Install the package in a Node.js or TypeScript project:

```bash
npm install structura-workbench
```

The core deliberately has no React dependency:

```ts
import { convertDocument, parseDocument, queryPath } from 'structura-workbench'

const parsed = parseDocument(source, 'auto')
const yaml = convertDocument(source, 'yaml')
const value = queryPath(parsed.data, '$.project.name')
```

## Direction

Structura aims to become a trustworthy structured-data toolkit rather than a collection of unrelated converters. The next milestones are:

1. JSON Schema validation and schema inference
2. Side-by-side semantic diff
3. Streaming Web Worker parser for large files
4. Editor integrations built on the published core API
5. Shareable plugin API for additional structured formats

See [ROADMAP.md](ROADMAP.md) and [the architecture notes](docs/architecture.md).

## Contributing

Bug reports, accessibility improvements, parser edge cases, fixtures, docs and careful new tools are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first. Never include private or production data in an issue.

## License

[MIT](LICENSE)
