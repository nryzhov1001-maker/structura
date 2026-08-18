export const sampleJson = `{
  "project": {
    "name": "Structura",
    "version": "0.1.0",
    "description": "A local-first workbench for structured data",
    "runtime": {
      "mode": "offline",
      "telemetry": false
    }
  },
  "formats": [
    { "name": "JSON", "enabled": true, "extensions": [".json", ".jsonc"] },
    { "name": "YAML", "enabled": true, "extensions": [".yaml", ".yml"] }
  ],
  "limits": {
    "maxFileSizeMb": 10,
    "maxDepth": 128
  },
  "contributors": [
    { "handle": "nick", "role": "maintainer" },
    { "handle": "you", "role": "early contributor" }
  ]
}`

export const sampleYaml = `project:
  name: Structura
  version: 0.1.0
  description: A local-first workbench for structured data
  runtime:
    mode: offline
    telemetry: false
formats:
  - name: JSON
    enabled: true
    extensions: [.json, .jsonc]
  - name: YAML
    enabled: true
    extensions: [.yaml, .yml]
limits:
  maxFileSizeMb: 10
  maxDepth: 128
contributors:
  - handle: nick
    role: maintainer
  - handle: you
    role: early contributor`
