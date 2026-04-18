import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { DEFAULT_MODEL, REQUEST_TIMEOUT_MS } from './src/config/appConfig.js'
import { readAppEnvironment, sanitizeText } from './src/lib/env.js'

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'
const MAX_REQUEST_BODY_BYTES = 64 * 1024
const MAX_REQUESTS_PER_MINUTE = 20
const RATE_LIMIT_WINDOW_MS = 60_000
const recentRequestsByIp = new Map()

const maskSecret = (value) => {
  const normalized = sanitizeText(value)
  if (!normalized) return 'missing'
  if (normalized.length <= 8) return 'present'
  return `${normalized.slice(0, 4)}…${normalized.slice(-4)}`
}

const maskSensitiveText = (value) => {
  if (typeof value !== 'string' || !value) return ''

  return value
    .replace(/(Bearer\s+)([A-Za-z0-9._-]+)/gi, (_, prefix, token) => {
      return `${prefix}${maskSecret(token)}`
    })
    .replace(/sk-[A-Za-z0-9._-]+/g, (token) => maskSecret(token))
}

const normalizeLogValue = (value, fallback = 'unknown') => {
  const normalized = sanitizeText(value)
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalized) return fallback
  return normalized.slice(0, 120)
}

const getRootDir = () => globalThis.process?.cwd?.() || '.'

const getServerProcessEnv = () => globalThis.process?.env ?? {}

const resolveServerApiKey = (viteEnv) => {
  const processEnv = getServerProcessEnv()
  return (
    sanitizeText(processEnv.OPENROUTER_API_KEY) ||
    sanitizeText(processEnv.VITE_OPENROUTER_API_KEY) ||
    sanitizeText(viteEnv.OPENROUTER_API_KEY) ||
    sanitizeText(viteEnv.VITE_OPENROUTER_API_KEY)
  )
}

const readJsonBody = async (req) => {
  let raw = ''
  let totalBytes = 0

  for await (const chunk of req) {
    totalBytes += chunk.length
    if (totalBytes > MAX_REQUEST_BODY_BYTES) {
      const error = new Error('Request body too large')
      error.statusCode = 413
      throw error
    }

    raw += chunk
  }

  if (!raw) return {}

  try {
    return JSON.parse(raw)
  } catch {
    const error = new Error('Malformed JSON body')
    error.statusCode = 400
    throw error
  }
}

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

const getClientIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for']
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim()
  }

  return req.socket?.remoteAddress || 'unknown'
}

const isRateLimited = (clientIp) => {
  const now = Date.now()
  const requests = recentRequestsByIp.get(clientIp) || []
  const recentRequests = requests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  )

  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    recentRequestsByIp.set(clientIp, recentRequests)
    return true
  }

  recentRequests.push(now)
  recentRequestsByIp.set(clientIp, recentRequests)
  return false
}

const startupEnvLogger = () => ({
  name: 'startup-env-logger',
  apply: 'serve',
  configureServer(server) {
    const env = loadEnv(server.config.mode, getRootDir(), '')
    const appEnvironment = readAppEnvironment(env)
    const apiKey = resolveServerApiKey(env)
    const legacyClientKey = sanitizeText(env.VITE_OPENROUTER_API_KEY)
    const summary = [
      {
        key: 'VITE_FEMALE_DATE',
        raw: appEnvironment.rawDefaults.personOneDate,
        parsed: appEnvironment.formDefaults.personOne.birthDate || 'invalid',
      },
      {
        key: 'VITE_FEMALE_TIME',
        raw: appEnvironment.rawDefaults.personOneTime,
        parsed: appEnvironment.formDefaults.personOne.birthTime || 'invalid',
      },
      {
        key: 'VITE_MALE_DATE',
        raw: appEnvironment.rawDefaults.personTwoDate,
        parsed: appEnvironment.formDefaults.personTwo.birthDate || 'invalid',
      },
      {
        key: 'VITE_MALE_TIME',
        raw: appEnvironment.rawDefaults.personTwoTime,
        parsed: appEnvironment.formDefaults.personTwo.birthTime || 'invalid',
      },
      {
        key: 'OPENROUTER_API_KEY',
        raw: maskSecret(apiKey),
        parsed: maskSecret(apiKey),
      },
      {
        key: 'APP_HOSTNAME',
        raw: sanitizeText(env.APP_HOSTNAME),
        parsed: sanitizeText(env.APP_HOSTNAME) || 'missing',
      },
    ]

    console.info('\n[Astrology Placebo Lab] Vite env at startup:')
    summary.forEach((item) => {
      console.info(`  ${item.key}: raw="${item.raw || 'missing'}" -> ${item.parsed}`)
    })

    const warnings = summary.filter(
      (item) =>
        item.key.startsWith('VITE_') &&
        item.raw &&
        item.parsed === 'invalid'
    )

    if (warnings.length) {
      console.warn('[Astrology Placebo Lab] Invalid env values detected:')
      warnings.forEach((item) => {
        console.warn(`  ${item.key}: "${item.raw}"`)
      })
    }

    if (legacyClientKey) {
      console.warn(
        `[Astrology Placebo Lab] VITE_OPENROUTER_API_KEY is still present in .env. It is ignored by client envPrefix, but should be removed in favor of OPENROUTER_API_KEY.`
      )
    }

    console.info(
      '[Astrology Placebo Lab] Request logs go to stdout with masked tokens. Restart `npm run dev` after changing .env.\n'
    )
  },
})

const openRouterProxy = () => ({
  name: 'openrouter-dev-proxy',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const requestUrl = new URL(req.url || '/', 'http://localhost')
      if (requestUrl.pathname !== '/api/openrouter/chat/completions') {
        next()
        return
      }

      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'Method not allowed' })
        return
      }

      const startedAt = Date.now()
      const clientIp = getClientIp(req)

      try {
        const contentType = req.headers['content-type'] || ''
        if (!String(contentType).startsWith('application/json')) {
          sendJson(res, 415, { error: 'Content-Type must be application/json' })
          return
        }

        if (isRateLimited(clientIp)) {
          console.warn(
            `[Astrology Placebo Lab] request rejected ip="${normalizeLogValue(clientIp)}" reason="rate_limited"`
          )
          sendJson(res, 429, {
            error: 'Too many requests. Please retry later.',
          })
          return
        }

        const env = loadEnv(server.config.mode, getRootDir(), '')
        const body = await readJsonBody(req)
        const clientApiKey = sanitizeText(body.apiKey)
        const serverApiKey = resolveServerApiKey(env)
        const effectiveApiKey = clientApiKey || serverApiKey
        const model = normalizeLogValue(body.model, DEFAULT_MODEL)
        const templateLabel = normalizeLogValue(body.templateLabel)
        const messageCount = Array.isArray(body.messages) ? body.messages.length : 0

        if (!Array.isArray(body.messages) || messageCount === 0 || messageCount > 12) {
          sendJson(res, 400, {
            error: 'messages must be a non-empty array with at most 12 entries',
          })
          return
        }

        if (!effectiveApiKey) {
          console.warn(
            `[Astrology Placebo Lab] request rejected ip="${normalizeLogValue(clientIp)}" template="${templateLabel}" reason="missing_api_key"`
          )
          sendJson(res, 400, {
            error:
              'OpenRouter API key is missing. Set OPENROUTER_API_KEY on the server or send it from the UI.',
          })
          return
        }

        console.info(
          `[Astrology Placebo Lab] request start ip="${normalizeLogValue(clientIp)}" template="${templateLabel}" model="${model}" key="${maskSecret(
            effectiveApiKey
          )}" source="${clientApiKey ? 'client' : 'server-env'}" messages=${messageCount}`
        )

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
        const upstreamResponse = await fetch(OPENROUTER_ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${effectiveApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': req.headers.origin || `https://${env.APP_HOSTNAME || 'localhost'}`,
            'X-Title': 'Astrology Placebo Lab',
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: Array.isArray(body.messages) ? body.messages : [],
            temperature:
              typeof body.temperature === 'number' ? body.temperature : 0.7,
          }),
        })
        clearTimeout(timeoutId)

        const responseText = await upstreamResponse.text()
        const elapsedMs = Date.now() - startedAt

        console.info(
          `[Astrology Placebo Lab] request end ip="${normalizeLogValue(clientIp)}" template="${templateLabel}" status=${upstreamResponse.status} elapsed_ms=${elapsedMs}`
        )

        res.statusCode = upstreamResponse.status
        res.setHeader(
          'Content-Type',
          upstreamResponse.headers.get('content-type') ||
            'application/json; charset=utf-8'
        )
        res.end(responseText)
      } catch (error) {
        const elapsedMs = Date.now() - startedAt
        const message =
          error?.name === 'AbortError'
            ? `OpenRouter timeout after ${REQUEST_TIMEOUT_MS / 1000}s`
            : maskSensitiveText(error?.message || 'Unknown proxy error')

        console.error(
          `[Astrology Placebo Lab] request failed ip="${normalizeLogValue(clientIp)}" elapsed_ms=${elapsedMs} error="${message}"`
        )

        sendJson(
          res,
          error?.name === 'AbortError'
            ? 504
            : typeof error?.statusCode === 'number'
              ? error.statusCode
              : 502,
          {
          error: message,
          }
        )
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  envPrefix: ['VITE_FEMALE_', 'VITE_MALE_'],
  plugins: [react(), startupEnvLogger(), openRouterProxy()],
})
