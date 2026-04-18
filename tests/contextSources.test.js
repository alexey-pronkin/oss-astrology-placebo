import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildContextSources,
  formatContextSourcesForPrompt,
} from '../src/lib/contextSources.js'

test('buildContextSources includes manual context and future external sources', () => {
  const contextSources = buildContextSources({
    manualContext: 'We are preparing for a long-distance move.',
    externalSources: [
      {
        id: 'memory-album',
        label: 'Альбом воспоминаний',
        content: 'Shared travel photos and relationship milestones.',
      },
    ],
  })

  assert.deepEqual(contextSources, [
    {
      id: 'manual-notes',
      label: 'Контекст пользователя',
      content: 'We are preparing for a long-distance move.',
    },
    {
      id: 'memory-album',
      label: 'Альбом воспоминаний',
      content: 'Shared travel photos and relationship milestones.',
    },
  ])
})

test('formatContextSourcesForPrompt falls back when context is empty', () => {
  assert.equal(formatContextSourcesForPrompt([]), 'не указано')
})
