import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  DEFAULT_MODEL,
  DEFAULT_UI_LOCALE,
  RECOMMENDED_MODEL,
  REQUEST_TIMEOUT_MS,
  STORAGE_KEY,
} from './config/appConfig.js'
import { getAppText } from './content/appText.js'
import { HeroSection } from './components/HeroSection.jsx'
import { PromptSection } from './components/PromptSection.jsx'
import { RelationshipFormSection } from './components/RelationshipFormSection.jsx'
import { ResultsSection } from './components/ResultsSection.jsx'
import { buildContextSources } from './lib/contextSources.js'
import { readAppEnvironment } from './lib/env.js'
import {
  createTimedAbortController,
  requestOpenRouterCompletion,
} from './lib/openRouter.js'
import {
  createDefaultAppState,
  restorePersistedState,
  serializeAppState,
} from './lib/persistence.js'
import { findPromptTemplate, PROMPT_TEMPLATES } from './lib/promptTemplates.js'
import {
  createFailedRequestState,
  createIdleRequestState,
  createRunningRequestState,
  createSuccessfulRequestState,
  getRequestProgress,
  updateRequestProgressState,
} from './lib/requestState.js'
import { formatElapsedDuration } from './lib/time.js'

const text = getAppText(DEFAULT_UI_LOCALE)
const environmentConfig = readAppEnvironment(import.meta.env)
const activeEnvWarnings = environmentConfig.envWarnings.filter(
  (warning) => warning.raw && !warning.parsed
)
const loadedEnvDefaults = environmentConfig.envSummary.filter(
  (item) => item.date || item.time
)

const createFallbackAppState = () =>
  createDefaultAppState({
    formDefaults: environmentConfig.formDefaults,
    defaultModel: DEFAULT_MODEL,
    defaults: text.defaults,
  })

const loadInitialAppState = () => {
  const fallbackState = createFallbackAppState()

  try {
    const rawState = globalThis.localStorage?.getItem(STORAGE_KEY)
    return restorePersistedState(rawState, fallbackState)
  } catch {
    return fallbackState
  }
}

const createResultEntry = (template, content) => ({
  id: template.id,
  label: template.label,
  content,
  createdAt: new Date().toISOString(),
})

function App() {
  const [appState, setAppState] = useState(loadInitialAppState)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [requestState, setRequestState] = useState(() =>
    createIdleRequestState(text.prompt.statusIdle)
  )
  const [elapsedMilliseconds, setElapsedMilliseconds] = useState(0)

  const requestStartedAtRef = useRef(0)
  const activeAbortControllerRef = useRef(null)

  const {
    apiKey,
    model,
    personOne,
    personTwo,
    manualContext,
    analysisFocus,
    responseTone,
    responseLanguage,
    selectedTemplateId,
    persistHistory,
    results,
  } = appState

  const selectedTemplate =
    findPromptTemplate(selectedTemplateId) || PROMPT_TEMPLATES[0]

  const contextSources = useMemo(
    () => buildContextSources({ manualContext }),
    [manualContext]
  )

  const promptInput = useMemo(
    () => ({
      personOne,
      personTwo,
      contextSources,
      analysisFocus,
      responseTone,
      responseLanguage,
    }),
    [
      personOne,
      personTwo,
      contextSources,
      analysisFocus,
      responseTone,
      responseLanguage,
    ]
  )

  const prompt = useMemo(
    () => selectedTemplate.buildPrompt(promptInput),
    [selectedTemplate, promptInput]
  )

  const requestProgress = getRequestProgress(requestState)
  const requestStateLabel = isLoading
    ? text.prompt.elapsed(formatElapsedDuration(elapsedMilliseconds))
    : requestState.total > 0
      ? `${requestState.completed}/${requestState.total}`
      : text.prompt.readyState
  const requestHint = isLoading
    ? text.prompt.loadingHint(
        requestState.activeTemplate,
        REQUEST_TIMEOUT_MS / 1000
      )
    : text.prompt.logsHint

  useEffect(() => {
    if (!isLoading) return undefined

    const intervalId = globalThis.setInterval(() => {
      setElapsedMilliseconds(Date.now() - requestStartedAtRef.current)
    }, 1000)

    return () => globalThis.clearInterval(intervalId)
  }, [isLoading])

  useEffect(() => {
    try {
      globalThis.localStorage?.setItem(
        STORAGE_KEY,
        JSON.stringify(serializeAppState(appState))
      )
    } catch {
      // Ignore localStorage write failures.
    }
  }, [appState])

  const updateAppState = (updater) => {
    setAppState((previousState) =>
      typeof updater === 'function'
        ? updater(previousState)
        : { ...previousState, ...updater }
    )
  }

  const updatePersonField = (personKey, field, value) => {
    updateAppState((previousState) => ({
      ...previousState,
      [personKey]: {
        ...previousState[personKey],
        [field]: value,
      },
    }))
  }

  const startRequest = (message, total, activeTemplate = '') => {
    requestStartedAtRef.current = Date.now()
    setElapsedMilliseconds(0)
    setRequestState(
      createRunningRequestState({
        message,
        total,
        activeTemplate,
      })
    )
  }

  const finishRequest = (message) => {
    setRequestState((previousState) =>
      createSuccessfulRequestState(previousState, message)
    )
  }

  const failRequest = (message) => {
    setRequestState((previousState) =>
      createFailedRequestState(previousState, message)
    )
  }

  const requestCompletion = async (promptText, templateLabel) => {
    const { controller, cleanup } = createTimedAbortController(
      REQUEST_TIMEOUT_MS
    )
    activeAbortControllerRef.current = controller

    try {
      return await requestOpenRouterCompletion({
        apiKey,
        model,
        templateLabel,
        promptText,
        signal: controller.signal,
      })
    } catch (requestError) {
      if (requestError?.name === 'AbortError') {
        throw new Error(
          `OpenRouter did not respond within ${REQUEST_TIMEOUT_MS / 1000} seconds.`
        )
      }

      throw requestError
    } finally {
      cleanup()

      if (activeAbortControllerRef.current === controller) {
        activeAbortControllerRef.current = null
      }
    }
  }

  const handleGenerateSelected = async () => {
    setError('')
    updateAppState({ results: [] })

    startRequest(
      text.prompt.singleRequestMessage(selectedTemplate.label),
      1,
      selectedTemplate.label
    )
    setIsLoading(true)

    try {
      const content = await requestCompletion(prompt, selectedTemplate.label)
      updateAppState({
        results: [createResultEntry(selectedTemplate, content)],
      })
      finishRequest(text.prompt.singleRequestSuccess)
    } catch (requestError) {
      const message = requestError.message || 'Failed to complete the request.'
      setError(message)
      failRequest(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateAll = async () => {
    setError('')
    updateAppState({ results: [] })

    startRequest(text.prompt.batchRequestMessage, PROMPT_TEMPLATES.length)
    setIsLoading(true)

    try {
      const collectedResults = []

      for (const [index, template] of PROMPT_TEMPLATES.entries()) {
        setRequestState((previousState) =>
          updateRequestProgressState(previousState, {
            message: text.prompt.batchProgressMessage(
              index + 1,
              PROMPT_TEMPLATES.length,
              template.label
            ),
            activeTemplate: template.label,
            completed: index,
            total: PROMPT_TEMPLATES.length,
          })
        )

        const promptText = template.buildPrompt(promptInput)
        const content = await requestCompletion(promptText, template.label)

        collectedResults.push(createResultEntry(template, content))
        updateAppState({ results: [...collectedResults] })
        setRequestState((previousState) =>
          updateRequestProgressState(previousState, {
            completed: index + 1,
          })
        )
      }

      finishRequest(text.prompt.batchRequestSuccess)
    } catch (requestError) {
      const message = requestError.message || 'Failed to complete the request.'
      setError(message)
      failRequest(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelRequest = () => {
    if (!activeAbortControllerRef.current) return
    activeAbortControllerRef.current.abort()
  }

  const handleCopyPrompt = async () => {
    await globalThis.navigator.clipboard.writeText(prompt)
  }

  const handleApplyEnvDefaults = () => {
    updateAppState((previousState) => ({
      ...previousState,
      apiKey: '',
      personOne: { ...environmentConfig.formDefaults.personOne },
      personTwo: { ...environmentConfig.formDefaults.personTwo },
    }))
  }

  const handlePersistHistoryChange = (nextValue) => {
    updateAppState((previousState) => ({
      ...previousState,
      persistHistory: nextValue,
      results: nextValue ? previousState.results : [],
    }))
  }

  return (
    <div className="page">
      <HeroSection
        text={text}
        apiKey={apiKey}
        model={model}
        recommendedModel={RECOMMENDED_MODEL}
        envWarnings={activeEnvWarnings}
        envDefaults={loadedEnvDefaults}
        onApiKeyChange={(nextApiKey) => updateAppState({ apiKey: nextApiKey })}
        onModelChange={(nextModel) => updateAppState({ model: nextModel })}
        onRecommendedModelPick={() => updateAppState({ model: RECOMMENDED_MODEL })}
        onApplyEnvDefaults={handleApplyEnvDefaults}
      />

      <main className="layout">
        <RelationshipFormSection
          text={text}
          personOne={personOne}
          personTwo={personTwo}
          manualContext={manualContext}
          analysisFocus={analysisFocus}
          responseTone={responseTone}
          responseLanguage={responseLanguage}
          onPersonFieldChange={updatePersonField}
          onManualContextChange={(nextContext) =>
            updateAppState({ manualContext: nextContext })
          }
          onAnalysisFocusChange={(nextFocus) =>
            updateAppState({ analysisFocus: nextFocus })
          }
          onResponseToneChange={(nextTone) =>
            updateAppState({ responseTone: nextTone })
          }
          onResponseLanguageChange={(nextLanguage) =>
            updateAppState({ responseLanguage: nextLanguage })
          }
        />

        <PromptSection
          text={text}
          templateOptions={PROMPT_TEMPLATES}
          selectedTemplateId={selectedTemplate.id}
          selectedTemplate={selectedTemplate}
          prompt={prompt}
          isLoading={isLoading}
          requestState={requestState}
          requestProgress={requestProgress}
          requestStateLabel={requestStateLabel}
          requestHint={requestHint}
          error={error}
          onTemplateChange={(nextTemplateId) =>
            updateAppState({ selectedTemplateId: nextTemplateId })
          }
          onCopyPrompt={handleCopyPrompt}
          onGenerateSelected={handleGenerateSelected}
          onGenerateAll={handleGenerateAll}
          onCancelRequest={handleCancelRequest}
        />

        <ResultsSection
          text={text}
          results={results}
          persistHistory={persistHistory}
          onPersistHistoryChange={handlePersistHistoryChange}
          onClearHistory={() => updateAppState({ results: [] })}
        />
      </main>
    </div>
  )
}

export default App
