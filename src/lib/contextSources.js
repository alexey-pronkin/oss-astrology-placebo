import { hasText, sanitizeText } from './env.js'

export const buildContextSources = ({
  manualContext,
  externalSources = [],
}) => {
  const normalizedSources = []

  if (hasText(manualContext)) {
    normalizedSources.push({
      id: 'manual-notes',
      label: 'Контекст пользователя',
      content: sanitizeText(manualContext),
    })
  }

  for (const source of externalSources) {
    const content = sanitizeText(source?.content)
    if (!content) continue

    normalizedSources.push({
      id: sanitizeText(source.id) || `source-${normalizedSources.length + 1}`,
      label: sanitizeText(source.label) || 'Дополнительный контекст',
      content,
    })
  }

  return normalizedSources
}

export const formatContextSourcesForPrompt = (
  contextSources,
  emptyFallback = 'не указано'
) => {
  if (!contextSources.length) return emptyFallback

  return contextSources
    .map((source) => `- ${source.label}: ${source.content}`)
    .join('\n')
}

