import { existsSync, readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { spawnSync } from 'node:child_process'

const TEXT_DECODER = new TextDecoder('utf-8', { fatal: false })
const MAX_FILE_BYTES = 1024 * 1024
const OPENROUTER_KEY_PREFIX = ['sk', 'or', 'v1'].join('-')

const secretPatterns = [
  {
    name: 'OpenRouter API key',
    pattern: new RegExp(`\\b${OPENROUTER_KEY_PREFIX}[-._A-Za-z0-9]{8,}\\b`, 'g'),
  },
  {
    name: 'GitHub token',
    pattern: /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/g,
  },
  {
    name: 'AWS access key id',
    pattern: /\b(A3T[A-Z0-9]|AKIA|ASIA)[A-Z0-9]{16}\b/g,
  },
  {
    name: 'Google API key',
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
  },
  {
    name: 'Private key block',
    pattern:
      /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g,
  },
  {
    name: 'High-risk env secret assignment',
    pattern:
      /\b(?:OPENROUTER_API_KEY|CROWDSEC_BOUNCER_KEY|API_KEY|ACCESS_TOKEN|AUTH_TOKEN|SECRET|PASSWORD)\s*=\s*(?![^\s#'"]*[<>])(?!replace-|change-me|your-|example|dummy|test|false|true|null\b)[^\s#'"]{12,}/gi,
  },
]

const binaryExtensions = new Set([
  '.avif',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.lockb',
  '.pdf',
  '.png',
  '.webp',
  '.woff',
  '.woff2',
  '.zip',
])

const runGit = (args, options = {}) => {
  const result = spawnSync('git', args, {
    encoding: options.encoding ?? 'utf8',
    maxBuffer: options.maxBuffer ?? 20 * 1024 * 1024,
  })

  if (result.status !== 0) {
    const message = result.stderr?.toString().trim() || result.stdout?.toString().trim()
    throw new Error(message || `git ${args.join(' ')} failed`)
  }

  return result.stdout
}

const getExtension = (path) => {
  const name = basename(path)
  const dotIndex = name.lastIndexOf('.')
  return dotIndex === -1 ? '' : name.slice(dotIndex).toLowerCase()
}

const isProbablyBinary = (path, buffer) => {
  if (binaryExtensions.has(getExtension(path))) return true
  return buffer.includes(0)
}

const getStagedFiles = () => {
  const output = runGit([
    'diff',
    '--cached',
    '--name-only',
    '--diff-filter=ACMR',
    '-z',
  ])

  return output.split('\0').filter(Boolean)
}

const getTrackedFiles = () => {
  const output = runGit(['ls-files', '-z'])
  return output.split('\0').filter(Boolean)
}

const readStagedFile = (path) => {
  const result = spawnSync('git', ['show', `:${path}`], {
    encoding: 'buffer',
    maxBuffer: MAX_FILE_BYTES + 1,
  })

  if (result.status !== 0) return null
  return result.stdout
}

const readWorkingTreeFile = (path) => {
  if (!existsSync(path)) return null
  return readFileSync(path)
}

const maskSecret = (value) => {
  if (value.length <= 12) return '<redacted>'
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

const getLineNumber = (content, index) =>
  content.slice(0, index).split('\n').length

const scanText = (path, content) => {
  const findings = []

  for (const { name, pattern } of secretPatterns) {
    pattern.lastIndex = 0

    for (const match of content.matchAll(pattern)) {
      findings.push({
        path,
        line: getLineNumber(content, match.index ?? 0),
        name,
        preview: maskSecret(match[0]),
      })
    }
  }

  return findings
}

const parseMode = () => {
  if (process.argv.includes('--all')) return 'all'
  return 'staged'
}

const readFilesForMode = (mode) => {
  const files = mode === 'all' ? getTrackedFiles() : getStagedFiles()

  return files.flatMap((path) => {
    const buffer =
      mode === 'all' ? readWorkingTreeFile(path) : readStagedFile(path)

    if (!buffer || buffer.length > MAX_FILE_BYTES) return []
    if (isProbablyBinary(path, buffer)) return []

    return [
      {
        path,
        content: TEXT_DECODER.decode(buffer),
      },
    ]
  })
}

const mode = parseMode()
const findings = readFilesForMode(mode).flatMap(({ path, content }) =>
  scanText(path, content)
)

if (findings.length) {
  console.error('Secret scan failed. Remove or rotate these values before committing:')

  for (const finding of findings) {
    console.error(
      `- ${finding.path}:${finding.line} ${finding.name} (${finding.preview})`
    )
  }

  process.exit(1)
}

console.log(`Secret scan passed (${mode}).`)
