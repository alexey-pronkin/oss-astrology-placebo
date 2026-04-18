import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createDefaultAppState,
  restorePersistedState,
  serializeAppState,
} from '../src/lib/persistence.js'

const fallbackState = createDefaultAppState({
  formDefaults: {
    personOne: {
      name: '',
      birthDate: '1990-10-25',
      birthTime: '04:00',
    },
    personTwo: {
      name: '',
      birthDate: '1993-08-25',
      birthTime: '22:00',
    },
  },
  defaultModel: 'openai/gpt-5.4',
  defaults: {
    analysisFocus: 'romantic relationship',
    responseTone: 'calm, scientific, empathetic',
    responseLanguage: 'English',
    selectedTemplateId: 'scientific',
    persistHistory: true,
  },
})

test('restorePersistedState supports legacy storage keys', () => {
  const restoredState = restorePersistedState(
    JSON.stringify({
      personA: {
        name: 'Alice',
        birthDate: '',
        birthTime: '',
      },
      personB: {
        name: 'Bob',
        birthDate: '1993-08-25',
        birthTime: '22:00',
      },
      context: 'Legacy context field',
      focus: 'friendship',
      tone: 'direct',
      language: 'Russian',
      selectedTemplateId: 'tarot-full-stack',
      persistHistory: false,
      model: 'openai/gpt-5.4-mini',
      results: [{ id: 'scientific', label: 'Scientific', content: 'ok' }],
    }),
    fallbackState
  )

  assert.equal(restoredState.personOne.name, 'Alice')
  assert.equal(restoredState.personOne.birthDate, '1990-10-25')
  assert.equal(restoredState.manualContext, 'Legacy context field')
  assert.equal(restoredState.analysisFocus, 'friendship')
  assert.equal(restoredState.responseTone, 'direct')
  assert.equal(restoredState.responseLanguage, 'Russian')
  assert.equal(restoredState.selectedTemplateId, 'tarot-full-stack')
  assert.equal(restoredState.persistHistory, false)
  assert.equal(restoredState.model, 'openai/gpt-5.4-mini')
  assert.equal(restoredState.results.length, 1)
})

test('serializeAppState never persists apiKey', () => {
  const serializedState = serializeAppState({
    ...fallbackState,
    apiKey: '<openrouter-api-key>',
    manualContext: 'Manual context',
    results: [{ id: 'scientific', label: 'Scientific', content: 'ok' }],
  })

  assert.equal('apiKey' in serializedState, false)
  assert.equal(serializedState.manualContext, 'Manual context')
  assert.equal(serializedState.results.length, 1)
})
