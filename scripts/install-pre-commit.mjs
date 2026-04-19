import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const hookPath = join(repoRoot, '.git', 'hooks', 'pre-commit')

const hookScript = `#!/bin/sh
set -eu

node scripts/scan-secrets.mjs --staged
`

mkdirSync(dirname(hookPath), { recursive: true })
writeFileSync(hookPath, hookScript, { mode: 0o755 })

console.log(`Installed ${hookPath}`)
