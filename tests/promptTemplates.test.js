import test from 'node:test'
import assert from 'node:assert/strict'
import { PROMPT_TEMPLATES } from '../src/lib/promptTemplates.js'

test('scientific prompt includes every provided context source', () => {
  const scientificTemplate = PROMPT_TEMPLATES.find(
    (template) => template.id === 'scientific'
  )

  const prompt = scientificTemplate.buildPrompt({
    personOne: {
      name: 'Alice',
      birthDate: '1990-10-25',
      birthTime: '04:00',
    },
    personTwo: {
      name: 'Bob',
      birthDate: '1993-08-25',
      birthTime: '22:00',
    },
    contextSources: [
      {
        id: 'manual-notes',
        label: 'Контекст пользователя',
        content: 'We are planning a move.',
      },
      {
        id: 'memory-album',
        label: 'Альбом воспоминаний',
        content: 'Shared milestones from the last two years.',
      },
    ],
    analysisFocus: 'romantic relationship',
    responseTone: 'calm, scientific, empathetic',
    responseLanguage: 'English',
  })

  assert.match(prompt, /Контекст пользователя: We are planning a move\./)
  assert.match(
    prompt,
    /Альбом воспоминаний: Shared milestones from the last two years\./
  )
})
