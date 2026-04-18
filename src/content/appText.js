export const localizedAppText = {
  ru: {
    locale: 'ru-RU',
    defaults: {
      analysisFocus: 'романтические отношения',
      responseTone: 'спокойный, научный, доброжелательный',
      responseLanguage: 'русский',
      selectedTemplateId: 'scientific',
      persistHistory: true,
    },
    hero: {
      eyebrow: 'Astrology Placebo Lab',
      titlePrefix: 'Научно-ориентированный промт для',
      titleAccent: 'астрологической совместимости',
      description:
        'Выберите честный научный режим или один из символических эзотерических стилей и сравните ответы.',
      meta: [
        { label: 'Модель', value: 'OpenRouter API' },
        { label: 'Режимы', value: 'Научный · Астрологический · Таро' },
        { label: 'Формат', value: 'Готовые шаблоны' },
      ],
    },
    settings: {
      apiKeyLabel: 'OpenRouter API key (optional)',
      apiKeyPlaceholder: 'Enter a key only when it is not configured on the server',
      apiKeyHint:
        'This field stays masked and is not persisted in localStorage. Leave it empty when the server already has OPENROUTER_API_KEY.',
      modelLabel: 'Model',
      modelPlaceholder: 'openai/gpt-5.4',
      recommendationLabel: 'Recommended:',
      envWarningTitle: 'Check your .env values',
      envDefaultsTitle: 'Validated defaults loaded from env',
      applyEnvDefaults: 'Reapply env defaults',
      envRestartHint:
        'No valid Vite defaults were detected. Restart the dev server after changing .env.',
      missingDate: 'date missing',
      missingTime: 'time missing',
    },
    form: {
      title: 'Pair details',
      personOneNameLabel: 'Name A',
      personOneNamePlaceholder: 'For example, Alina',
      personOneDateLabel: 'Birth date A',
      personOneTimeLabel: 'Birth time A',
      personTwoNameLabel: 'Name B',
      personTwoNamePlaceholder: 'For example, Daniil',
      personTwoDateLabel: 'Birth date B',
      personTwoTimeLabel: 'Birth time B',
      contextLabel: 'Context',
      contextPlaceholder:
        'Describe the relationship background, constraints, goals, and relevant observations...',
      focusLabel: 'Analysis focus',
      toneLabel: 'Tone',
      languageLabel: 'Response language',
    },
    prompt: {
      title: 'Prompt template',
      templateLabel: 'Style',
      copyHint:
        'You can copy the generated prompt and use it in any LLM, even without OpenRouter.',
      copyPrompt: 'Copy prompt',
      generateSelected: 'Generate selected template',
      generateAll: 'Generate all templates',
      cancelRequest: 'Cancel request',
      runningButton: 'Request in progress…',
      readyState: 'ready',
      statusIdle: 'Waiting for a request',
      logsHint:
        'The status block shows request progress. Detailed logs are written to server stdout only.',
      singleRequestMessage: (label) => `Generating template "${label}"`,
      batchRequestMessage: 'Generating all templates sequentially',
      batchProgressMessage: (index, total, label) =>
        `Generating ${index} of ${total}: "${label}"`,
      singleRequestSuccess: 'Done: model response received',
      batchRequestSuccess: 'Done: responses collected for all templates',
      elapsed: (value) => `Elapsed ${value}`,
      loadingHint: (label, timeoutSeconds) =>
        `Active template: ${label || 'preparing'} · timeout ${timeoutSeconds}s`,
    },
    results: {
      title: 'Model response',
      persistHistory: 'Persist history',
      clearHistory: 'Clear history',
      emptyState:
        'The response will appear here after generation. You can also use the prompt directly in another LLM.',
    },
  },
  en: {
    locale: 'en-US',
    defaults: {
      analysisFocus: 'romantic relationship',
      responseTone: 'calm, scientific, empathetic',
      responseLanguage: 'English',
      selectedTemplateId: 'scientific',
      persistHistory: true,
    },
    hero: {
      eyebrow: 'Astrology Placebo Lab',
      titlePrefix: 'Science-oriented prompt for',
      titleAccent: 'astrological compatibility',
      description:
        'Choose an honest scientific mode or one of the symbolic esoteric styles and compare the outputs.',
      meta: [
        { label: 'Model', value: 'OpenRouter API' },
        { label: 'Modes', value: 'Scientific · Astrology · Tarot' },
        { label: 'Format', value: 'Ready-made templates' },
      ],
    },
    settings: {
      apiKeyLabel: 'OpenRouter API key (optional)',
      apiKeyPlaceholder: 'Enter a key only when it is not configured on the server',
      apiKeyHint:
        'This field stays masked and is not persisted in localStorage. Leave it empty when the server already has OPENROUTER_API_KEY.',
      modelLabel: 'Model',
      modelPlaceholder: 'openai/gpt-5.4',
      recommendationLabel: 'Recommended:',
      envWarningTitle: 'Check your .env values',
      envDefaultsTitle: 'Validated defaults loaded from env',
      applyEnvDefaults: 'Reapply env defaults',
      envRestartHint:
        'No valid Vite defaults were detected. Restart the dev server after changing .env.',
      missingDate: 'date missing',
      missingTime: 'time missing',
    },
    form: {
      title: 'Pair details',
      personOneNameLabel: 'Name A',
      personOneNamePlaceholder: 'For example, Alina',
      personOneDateLabel: 'Birth date A',
      personOneTimeLabel: 'Birth time A',
      personTwoNameLabel: 'Name B',
      personTwoNamePlaceholder: 'For example, Daniel',
      personTwoDateLabel: 'Birth date B',
      personTwoTimeLabel: 'Birth time B',
      contextLabel: 'Context',
      contextPlaceholder:
        'Describe the relationship background, constraints, goals, and relevant observations...',
      focusLabel: 'Analysis focus',
      toneLabel: 'Tone',
      languageLabel: 'Response language',
    },
    prompt: {
      title: 'Prompt template',
      templateLabel: 'Style',
      copyHint:
        'You can copy the generated prompt and use it in any LLM, even without OpenRouter.',
      copyPrompt: 'Copy prompt',
      generateSelected: 'Generate selected template',
      generateAll: 'Generate all templates',
      cancelRequest: 'Cancel request',
      runningButton: 'Request in progress…',
      readyState: 'ready',
      statusIdle: 'Waiting for a request',
      logsHint:
        'The status block shows request progress. Detailed logs are written to server stdout only.',
      singleRequestMessage: (label) => `Generating template "${label}"`,
      batchRequestMessage: 'Generating all templates sequentially',
      batchProgressMessage: (index, total, label) =>
        `Generating ${index} of ${total}: "${label}"`,
      singleRequestSuccess: 'Done: model response received',
      batchRequestSuccess: 'Done: responses collected for all templates',
      elapsed: (value) => `Elapsed ${value}`,
      loadingHint: (label, timeoutSeconds) =>
        `Active template: ${label || 'preparing'} · timeout ${timeoutSeconds}s`,
    },
    results: {
      title: 'Model response',
      persistHistory: 'Persist history',
      clearHistory: 'Clear history',
      emptyState:
        'The response will appear here after generation. You can also use the prompt directly in another LLM.',
    },
  },
}

export const getAppText = (locale) =>
  localizedAppText[locale] || localizedAppText.ru

