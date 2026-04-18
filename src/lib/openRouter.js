import { DEFAULT_MODEL } from '../config/appConfig.js'
import { pickFirstText } from './env.js'

const OPENROUTER_PROXY_ENDPOINT = '/api/openrouter/chat/completions'

export const createTimedAbortController = (timeoutMs) => {
  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs)

  return {
    controller,
    cleanup: () => globalThis.clearTimeout(timeoutId),
  }
}

export const requestOpenRouterCompletion = async ({
  apiKey,
  model = DEFAULT_MODEL,
  templateLabel,
  promptText,
  signal,
  fetchImplementation = globalThis.fetch,
}) => {
  const response = await fetchImplementation(OPENROUTER_PROXY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      apiKey: pickFirstText(apiKey),
      model: model.trim() || DEFAULT_MODEL,
      templateLabel,
      messages: [
        {
          role: 'system',
          content:
            'Ты внимательный и этичный ассистент. Следуй структуре и ограничениям запроса.',
        },
        {
          role: 'user',
          content: promptText,
        },
      ],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter error: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content || 'Ответ пустой. Проверьте модель и параметры.'
}

