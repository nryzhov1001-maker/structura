import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { index: 'src/lib/index.ts' },
    format: ['esm', 'cjs'],
    sourcemap: true,
    target: 'node20',
    splitting: false,
    clean: true,
    outDir: 'package-dist',
  },
  {
    entry: { cli: 'src/cli.ts' },
    format: ['esm'],
    banner: { js: '#!/usr/bin/env node' },
    sourcemap: true,
    target: 'node20',
    splitting: false,
    clean: false,
    outDir: 'package-dist',
  },
])
