import { mergeStoredPerson } from './env.js'

export const createDefaultAppState = ({
  formDefaults,
  defaultModel,
  defaults,
}) => ({
  apiKey: '',
  model: defaultModel,
  personOne: { ...formDefaults.personOne },
  personTwo: { ...formDefaults.personTwo },
  manualContext: '',
  analysisFocus: defaults.analysisFocus,
  responseTone: defaults.responseTone,
  responseLanguage: defaults.responseLanguage,
  selectedTemplateId: defaults.selectedTemplateId,
  persistHistory: defaults.persistHistory,
  results: [],
})

export const restorePersistedState = (rawState, fallbackState) => {
  if (!rawState) return fallbackState

  let parsedState

  try {
    parsedState = JSON.parse(rawState)
  } catch {
    return fallbackState
  }

  const personOne = parsedState.personOne || parsedState.personA
  const personTwo = parsedState.personTwo || parsedState.personB

  return {
    ...fallbackState,
    personOne: personOne
      ? mergeStoredPerson(personOne, fallbackState.personOne)
      : fallbackState.personOne,
    personTwo: personTwo
      ? mergeStoredPerson(personTwo, fallbackState.personTwo)
      : fallbackState.personTwo,
    manualContext:
      typeof parsedState.manualContext === 'string'
        ? parsedState.manualContext
        : typeof parsedState.context === 'string'
          ? parsedState.context
          : fallbackState.manualContext,
    analysisFocus:
      typeof parsedState.analysisFocus === 'string'
        ? parsedState.analysisFocus
        : typeof parsedState.focus === 'string'
          ? parsedState.focus
          : fallbackState.analysisFocus,
    responseTone:
      typeof parsedState.responseTone === 'string'
        ? parsedState.responseTone
        : typeof parsedState.tone === 'string'
          ? parsedState.tone
          : fallbackState.responseTone,
    responseLanguage:
      typeof parsedState.responseLanguage === 'string'
        ? parsedState.responseLanguage
        : typeof parsedState.language === 'string'
          ? parsedState.language
          : fallbackState.responseLanguage,
    selectedTemplateId:
      typeof parsedState.selectedTemplateId === 'string'
        ? parsedState.selectedTemplateId
        : fallbackState.selectedTemplateId,
    persistHistory:
      typeof parsedState.persistHistory === 'boolean'
        ? parsedState.persistHistory
        : fallbackState.persistHistory,
    model:
      typeof parsedState.model === 'string'
        ? parsedState.model
        : fallbackState.model,
    results: Array.isArray(parsedState.results) ? parsedState.results : [],
  }
}

export const serializeAppState = (appState) => ({
  personOne: appState.personOne,
  personTwo: appState.personTwo,
  manualContext: appState.manualContext,
  analysisFocus: appState.analysisFocus,
  responseTone: appState.responseTone,
  responseLanguage: appState.responseLanguage,
  selectedTemplateId: appState.selectedTemplateId,
  persistHistory: appState.persistHistory,
  model: appState.model,
  results: appState.persistHistory ? appState.results : [],
})

