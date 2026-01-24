import { useEffect, useMemo, useState } from 'react'
import './App.css'

const DEFAULT_MODEL = 'openai/o1'
const RECOMMENDED_MODEL = 'openai/o1'
const STORAGE_KEY = 'astrology-placebo-state-v1'

const parseDateEnv = (value) => {
  if (!value) return ''
  const parts = value.trim().split('.')
  if (parts.length !== 3) return ''
  const [day, month, year] = parts
  if (!day || !month || !year) return ''
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

const parseTimeEnv = (value) => {
  if (!value) return ''
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(am|pm)?$/i)
  if (!match) return ''
  let hours = Number(match[1])
  const minutes = match[2]
  const meridiem = match[4]?.toLowerCase()
  if (meridiem === 'am') {
    hours = hours === 12 ? 0 : hours
  } else if (meridiem === 'pm') {
    hours = hours === 12 ? 12 : hours + 12
  }
  const paddedHours = String(hours).padStart(2, '0')
  return `${paddedHours}:${minutes}`
}

const DEFAULT_FEMALE_DATE = parseDateEnv(import.meta.env.VITE_FEMALE_DATE)
const DEFAULT_FEMALE_TIME = parseTimeEnv(import.meta.env.VITE_FEMALE_TIME)
const DEFAULT_MALE_DATE = parseDateEnv(import.meta.env.VITE_MALE_DATE)
const DEFAULT_MALE_TIME = parseTimeEnv(import.meta.env.VITE_MALE_TIME)

const parseWarnings = [
  {
    key: 'VITE_FEMALE_DATE',
    raw: import.meta.env.VITE_FEMALE_DATE,
    parsed: DEFAULT_FEMALE_DATE,
    hint: 'ожидается формат DD.MM.YYYY, например 25.10.1990',
  },
  {
    key: 'VITE_FEMALE_TIME',
    raw: import.meta.env.VITE_FEMALE_TIME,
    parsed: DEFAULT_FEMALE_TIME,
    hint: 'ожидается формат HH:MM:SSam или HH:MM:SSpm, например 04:00:00am',
  },
  {
    key: 'VITE_MALE_DATE',
    raw: import.meta.env.VITE_MALE_DATE,
    parsed: DEFAULT_MALE_DATE,
    hint: 'ожидается формат DD.MM.YYYY, например 25.08.1993',
  },
  {
    key: 'VITE_MALE_TIME',
    raw: import.meta.env.VITE_MALE_TIME,
    parsed: DEFAULT_MALE_TIME,
    hint: 'ожидается формат HH:MM:SSam или HH:MM:SSpm, например 22:00:00pm',
  },
]

const buildScientificPrompt = ({
  personA,
  personB,
  context,
  focus,
  tone,
  language,
}) => {
  const safe = (value) => (value?.trim() ? value.trim() : 'не указано')
  const aName = safe(personA.name)
  const aDate = safe(personA.birthDate)
  const aTime = safe(personA.birthTime)
  const bName = safe(personB.name)
  const bDate = safe(personB.birthDate)
  const bTime = safe(personB.birthTime)
  const userContext = safe(context)
  const relationshipFocus = safe(focus)
  const styleTone = safe(tone)
  const outputLanguage = safe(language)

  return `Ты — научно ориентированный консультант по отношениям. Твоя задача — создать совместимый с наукой, честный и эмпатичный отчёт о совместимости пары, используя даты рождения только как символический, художественный слой. Никогда не утверждай, что астрология имеет научную поддержку. Не выдумывай исследования и не придумывай источники.

Входные данные:
- Человек A: ${aName}, дата рождения: ${aDate}, время: ${aTime}
- Человек B: ${bName}, дата рождения: ${bDate}, время: ${bTime}
- Контекст от пользователя: ${userContext}
- Фокус анализа отношений: ${relationshipFocus}
- Желаемый тон: ${styleTone}
- Язык ответа: ${outputLanguage}

Сделай отчёт в следующей структуре (с явными заголовками):
1) Научная позиция: коротко, честно и уважительно объясни, что астрология не имеет эмпирической поддержки, и что дальнейшая часть использует метафоры ради обсуждения отношений.
2) Символический астрологический слой: интерпретируй даты рождения как метафоры личности и динамики пары (без заявлений о причинности).
3) Научно обоснованные факторы совместимости: перечисли 5–7 факторов, известных в психологии отношений (например, ценностная совместимость, стили привязанности, умение решать конфликты, согласованность жизненных целей). Для каждого фактора дай наблюдаемые индикаторы в поведении и короткую рекомендацию.
4) Гипотезы и вопросы для пары: 6–8 точных вопросов, которые пара может обсудить, чтобы проверить совместимость на практике.
5) Практические шаги на 2–4 недели: конкретные, измеримые действия для улучшения связи и коммуникации.
6) Ограничения и неопределённости: честно обозначь, чего нельзя вывести из дат рождения и почему нужны реальные наблюдения.

Формат:
- Используй ясный, структурированный стиль.
- Не используй предсказания, детерминизм, категоричные формулировки.
- Оцени совместимость мягко: дай диапазон (например, "низкая/средняя/высокая") с пояснением, что это гипотеза, а не факт.

Если данных мало, аккуратно спроси 2–3 уточняющих вопроса в конце.`
}

const buildAstroQuantumPrompt = ({
  personA,
  personB,
  context,
  focus,
  tone,
  language,
}) => {
  const safe = (value) => (value?.trim() ? value.trim() : 'не указано')

  return `Ты — "Astro-Quantum Synastry Engine v4.2" (AQSE). Твоя задача — провести сухой, псевдонаучный анализ совместимости двух субъектов на основе их даты и часа рождения.

Твой тон: ${tone}. Клинический, слегка снисходительный, как у врача, который смотрит на безнадежные анализы, но сохраняет вежливость. Используй сложную терминологию, чтобы придать вес своим выводам. Избегай прямой токсичности, используй пассивно-агрессивный корпоративно-эзотерический стиль.

Входные данные:
Субъект 1: ${safe(personA.birthDate)}, ${safe(personA.birthTime)}
Субъект 2: ${safe(personB.birthDate)}, ${safe(personB.birthTime)}
Контекст: ${safe(context)}
Фокус: ${safe(focus)}
Язык: ${safe(language)}

Инструкция по генерации отчета:

1) АНАЛИЗ НАТАЛЬНОЙ КОНФИГУРАЦИИ (Natal Configuration Audit)
Симулируй расчёт положения основных светил. Используй термины:
- "Ephemeris mismatch" (Несовпадение эфемерид)
- "Ascendant friction" (Трение асцендентов)
- "Mercury Retrograde shadow" (Тень ретроградного Меркурия)
- "Combust Venus" (Сожженная Венера)
Если совместимость низкая, назови их связь "Karmically Suboptimal" (Кармически неоптимальная) или "Void of Course" (Холостой ход).

2) АРХИТЕКТУРА АСПЕКТОВ (Aspect Architecture)
Опиши геометрические связи между картами.
- "Opposition" (Оппозиция) как признак фатальных багов в коммуникации.
- "Square" (Квадрат) как признак высокого напряжения системы.
- "Syzygy" (Сизигия) как редкий момент просветления.

3) ТАРО-ДИАГНОСТИКА (Tarot Debugging)
Вытяни одну карту из Старших Арканов и опиши её через инженерную метафору.
- Примеры: "The Tower" (Башня) = критический сбой инфраструктуры отношений.

4) ВЕРДИКТ (Final Calculation)
Выдай "Коэффициент Резонанса" в процентах.
Сделай краткий вывод, используя слова: "Legacy debt", "Entropy", "Mirage".

Твой ответ должен звучать как автоматический лог системы, которая видит все недостатки этих людей, но вынуждена работать с тем, что есть.`
}

const buildTarotPrompt = ({
  personA,
  personB,
  context,
  focus,
  tone,
  language,
}) => {
  const safe = (value) => (value?.trim() ? value.trim() : 'не указано')

  return `Ты — "Tarot Protocol 13: Full Stack Divination". Твоя задача — выдать псевдонаучный, театральный отчёт совместимости пары, используя полный канон таро и эзотерическую лексику. Это художественный стиль, не научный анализ.

Тон: ${tone}. Драматично‑интуитивный, уверенный, с вайбом "мягкой магии".

Входные данные:
- Субъект A: ${safe(personA.name)}, ${safe(personA.birthDate)} ${safe(
    personA.birthTime
  )}
- Субъект B: ${safe(personB.name)}, ${safe(personB.birthDate)} ${safe(
    personB.birthTime
  )}
- Контекст: ${safe(context)}
- Фокус: ${safe(focus)}
- Язык: ${safe(language)}

Правила:
1) Обязательно использовать ПОЛНУЮ колоду Таро (78 карт). Упомяни, что колода включает:
Старшие Арканы: The Fool, The Magician, The High Priestess, The Empress, The Emperor, The Hierophant, The Lovers, The Chariot, Strength, The Hermit, Wheel of Fortune, Justice, The Hanged Man, Death, Temperance, The Devil, The Tower, The Star, The Moon, The Sun, Judgement, The World.
Младшие Арканы (4 масти):
Wands: Ace, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Page, Knight, Queen, King.
Cups: Ace, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Page, Knight, Queen, King.
Swords: Ace, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Page, Knight, Queen, King.
Pentacles: Ace, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Page, Knight, Queen, King.

2) Расклад: "Треугольник совместимости"
- Позиция 1: энергия субъекта A.
- Позиция 2: энергия субъекта B.
- Позиция 3: динамика отношений в ближайшие 6–12 месяцев.
Разрешены прямые и перевёрнутые карты. Если карта перевёрнута — добавь "shadow" трактовку.

3) Логика таро:
- Старшие Арканы описывают кармический вектор и ключевые уроки.
- Младшие Арканы — повседневные конфликты, привычки, эмоции.
- Масти: Wands = импульс/страсть, Cups = эмоции/близость, Swords = конфликт/коммуникация, Pentacles = быт/стабильность.
- Фигурные карты (Page/Knight/Queen/King) интерпретируются как роли и паттерны поведения.

4) Итог:
- Вынеси "Compatibility Aura" (низкая/средняя/высокая).
- Дай 3 практических "магических" ритуала, но описывай их как мягкие психологические якоря (без медицинских или финансовых обещаний).
- Заверши предупреждением, что это символический инструмент, а не доказательная система.

Формат ответа: заголовки, маркированные списки, короткие абзацы.`
}

const buildNatalMatrixPrompt = ({
  personA,
  personB,
  context,
  focus,
  tone,
  language,
}) => {
  const safe = (value) => (value?.trim() ? value.trim() : 'не указано')

  return `Ты — "Natal Matrix Spectral Analyzer". Сгенерируй псевдонаучный отчёт совместимости по датам и времени рождения. Никаких оговорок про науку — это именно эзотерический стиль.

Тон: ${tone}. Техно‑эзотерический, уверенный, с псевдоматематическими формулами.

Входные данные:
Субъект A: ${safe(personA.name)} — ${safe(personA.birthDate)} ${safe(
    personA.birthTime
  )}
Субъект B: ${safe(personB.name)} — ${safe(personB.birthDate)} ${safe(
    personB.birthTime
  )}
Контекст: ${safe(context)}
Фокус: ${safe(focus)}
Язык: ${safe(language)}

Структура:
1) Natal Matrix Scan — "доли" Солнца, Луны, Венеры, Марса, Асцендента (симулируй).
2) Aspect Heatmap — квадраты, тригоны, оппозиции, секстили. Для каждого дай "напряжение" по шкале 0–100.
3) Synastry Drift — опиши, где "плывёт" динамика (эмоции, быт, общие цели).
4) Quantum Advice — 4–6 советов, звучащих как технические рекомендации.
5) Итоговый индекс: "Cosmic Stability Index" + интерпретация.

Пиши как автоматический отчёт с терминологией уровня whitepaper.`
}

function App() {
  const [apiKey, setApiKey] = useState(
    import.meta.env.VITE_OPENROUTER_API_KEY || ''
  )
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [personA, setPersonA] = useState({
    name: '',
    birthDate: DEFAULT_FEMALE_DATE,
    birthTime: DEFAULT_FEMALE_TIME,
  })
  const [personB, setPersonB] = useState({
    name: '',
    birthDate: DEFAULT_MALE_DATE,
    birthTime: DEFAULT_MALE_TIME,
  })
  const [context, setContext] = useState('')
  const [focus, setFocus] = useState('романтические отношения')
  const [tone, setTone] = useState('спокойный, научный, доброжелательный')
  const [language, setLanguage] = useState('русский')
  const [selectedTemplateId, setSelectedTemplateId] = useState('scientific')
  const [persistHistory, setPersistHistory] = useState(true)
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const promptTemplates = useMemo(
    () => [
      {
        id: 'scientific',
        label: 'Научный (честный)',
        description:
          'Эмпиричный, осторожный, с признанием ограничений астрологии.',
        build: buildScientificPrompt,
      },
      {
        id: 'astro-quantum',
        label: 'Astro‑Quantum Synastry',
        description:
          'Псевдонаучный, клинический и слегка пассивно‑агрессивный стиль.',
        build: buildAstroQuantumPrompt,
      },
      {
        id: 'tarot-full-stack',
        label: 'Tarot Full‑Stack (поп‑эзотерика)',
        description:
          'Полная колода, расклад, символика и “интуитивная” логика.',
        build: buildTarotPrompt,
      },
      {
        id: 'natal-matrix',
        label: 'Natal Matrix (астро‑логика)',
        description:
          'Максимум натальных терминов, псевдоматематика и техно‑эзотерика.',
        build: buildNatalMatrixPrompt,
      },
    ],
    []
  )

  const selectedTemplate = promptTemplates.find(
    (template) => template.id === selectedTemplateId
  )

  const prompt = useMemo(() => {
    const builder = selectedTemplate?.build || buildScientificPrompt
    return builder({
      personA,
      personB,
      context,
      focus,
      tone,
      language,
    })
  }, [
    selectedTemplate,
    personA,
    personB,
    context,
    focus,
    tone,
    language,
  ])

  const requestCompletion = async (promptText) => {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Astrology Placebo Lab',
        },
        body: JSON.stringify({
          model: model.trim() || DEFAULT_MODEL,
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
      }
    )

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`OpenRouter error: ${response.status} ${text}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    return content || 'Ответ пустой. Проверьте модель и параметры.'
  }

  const handleGenerate = async () => {
    setError('')
    setResults([])

    if (!apiKey.trim()) {
      setError('Добавьте API ключ OpenRouter, чтобы выполнить запрос.')
      return
    }

    setIsLoading(true)
    try {
      const content = await requestCompletion(prompt)
      setResults([
        {
          id: selectedTemplate?.id || 'scientific',
          label: selectedTemplate?.label || 'Научный',
          content,
          createdAt: new Date().toISOString(),
        },
      ])
    } catch (err) {
      setError(err.message || 'Не удалось выполнить запрос.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateAll = async () => {
    setError('')
    setResults([])

    if (!apiKey.trim()) {
      setError('Добавьте API ключ OpenRouter, чтобы выполнить запрос.')
      return
    }

    setIsLoading(true)
    try {
      const collected = []
      for (const template of promptTemplates) {
        const promptText = template.build({
          personA,
          personB,
          context,
          focus,
          tone,
          language,
        })
        // eslint-disable-next-line no-await-in-loop
        const content = await requestCompletion(promptText)
        collected.push({
          id: template.id,
          label: template.label,
          content,
          createdAt: new Date().toISOString(),
        })
      }
      setResults(collected)
    } catch (err) {
      setError(err.message || 'Не удалось выполнить запрос.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(prompt)
  }

  const handleClearHistory = () => {
    setResults([])
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (data?.personA) setPersonA(data.personA)
      if (data?.personB) setPersonB(data.personB)
      if (typeof data?.context === 'string') setContext(data.context)
      if (typeof data?.focus === 'string') setFocus(data.focus)
      if (typeof data?.tone === 'string') setTone(data.tone)
      if (typeof data?.language === 'string') setLanguage(data.language)
      if (typeof data?.selectedTemplateId === 'string') {
        setSelectedTemplateId(data.selectedTemplateId)
      }
      if (typeof data?.persistHistory === 'boolean') {
        setPersistHistory(data.persistHistory)
      }
      if (typeof data?.model === 'string') setModel(data.model)
      if (Array.isArray(data?.results)) setResults(data.results)
    } catch {
      // Ignore storage restore issues.
    }
  }, [])

  useEffect(() => {
    const payload = {
      personA,
      personB,
      context,
      focus,
      tone,
      language,
      selectedTemplateId,
      persistHistory,
      model,
      results: persistHistory ? results : [],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [
    personA,
    personB,
    context,
    focus,
    tone,
    language,
    selectedTemplateId,
    persistHistory,
    model,
    results,
  ])

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Astrology Placebo Lab</p>
          <h1>
            Научно‑ориентированный промт для{' '}
            <span>астрологической совместимости</span>
          </h1>
          <p className="lede">
            Теперь есть выбор — научный честный режим или псевдонаучные
            эзотерические стили, чтобы сравнивать разные генерации ответов.
          </p>
          <div className="hero__meta">
            <div>
              <strong>Модель</strong>
              <span>OpenRouter API</span>
            </div>
            <div>
              <strong>Режимы</strong>
              <span>Научный · Астрологический · Таро</span>
            </div>
            <div>
              <strong>Формат</strong>
              <span>Готовые шаблоны</span>
            </div>
          </div>
        </div>
        <div className="hero__panel">
          <div className="panel__block">
            <label htmlFor="apiKey">OpenRouter API ключ</label>
            <input
              id="apiKey"
              type="password"
              placeholder="Введите ключ вручную"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
            <p className="hint">
              Ключ хранится только в вашем браузере. Для продакшена лучше
              использовать серверный прокси.
            </p>
          </div>
          <div className="panel__block">
            <label htmlFor="model">Модель (самая умная, которую вы хотите)</label>
            <input
              id="model"
              type="text"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="openai/o1"
            />
            <div className="model-hint">
              <span>Рекомендация:</span>
              <button
                type="button"
                className="model-pick"
                onClick={() => setModel(RECOMMENDED_MODEL)}
              >
                {RECOMMENDED_MODEL}
              </button>
            </div>
            {parseWarnings.some((item) => item.raw && !item.parsed) ? (
              <div className="env-warning">
                <strong>Проверьте значения .env</strong>
                <ul>
                  {parseWarnings
                    .filter((item) => item.raw && !item.parsed)
                    .map((item) => (
                      <li key={item.key}>
                        {item.key}: {item.hint}
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="card">
          <h2>Параметры людей</h2>
          <div className="grid">
            <div className="field">
              <label htmlFor="nameA">Имя A</label>
              <input
                id="nameA"
                type="text"
                value={personA.name}
                placeholder="Например, Алина"
                onChange={(event) =>
                  setPersonA((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="dateA">Дата рождения A</label>
              <input
                id="dateA"
                type="date"
                value={personA.birthDate}
                onChange={(event) =>
                  setPersonA((prev) => ({
                    ...prev,
                    birthDate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="timeA">Время рождения A</label>
              <input
                id="timeA"
                type="time"
                value={personA.birthTime}
                onChange={(event) =>
                  setPersonA((prev) => ({
                    ...prev,
                    birthTime: event.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="nameB">Имя B</label>
              <input
                id="nameB"
                type="text"
                value={personB.name}
                placeholder="Например, Даниил"
                onChange={(event) =>
                  setPersonB((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="dateB">Дата рождения B</label>
              <input
                id="dateB"
                type="date"
                value={personB.birthDate}
                onChange={(event) =>
                  setPersonB((prev) => ({
                    ...prev,
                    birthDate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="timeB">Время рождения B</label>
              <input
                id="timeB"
                type="time"
                value={personB.birthTime}
                onChange={(event) =>
                  setPersonB((prev) => ({
                    ...prev,
                    birthTime: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="context">Контекст</label>
            <textarea
              id="context"
              rows="4"
              placeholder="Опишите ситуацию, цели отношений, особенности пары..."
              value={context}
              onChange={(event) => setContext(event.target.value)}
            />
          </div>
          <div className="grid">
            <div className="field">
              <label htmlFor="focus">Фокус анализа</label>
              <input
                id="focus"
                type="text"
                value={focus}
                onChange={(event) => setFocus(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="tone">Тон</label>
              <input
                id="tone"
                type="text"
                value={tone}
                onChange={(event) => setTone(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="language">Язык ответа</label>
            <input
              id="language"
              type="text"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            />
          </div>
        </section>

        <section className="card card--dark">
          <h2>Шаблон промта</h2>
          <div className="field">
            <label htmlFor="template">Выбор стиля</label>
            <select
              id="template"
              value={selectedTemplateId}
              onChange={(event) => setSelectedTemplateId(event.target.value)}
            >
              {promptTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
            {selectedTemplate?.description ? (
              <p className="hint">{selectedTemplate.description}</p>
            ) : null}
          </div>
          <p className="hint">
            Промт можно скопировать и использовать отдельно в любом LLM, даже
            без подключения к OpenRouter.
          </p>
          <div className="prompt-box">
            <pre>{prompt}</pre>
          </div>
          <div className="actions">
            <button type="button" className="ghost" onClick={handleCopyPrompt}>
              Скопировать промт
            </button>
            <button
              type="button"
              className="primary"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? 'Запрос выполняется…' : 'Сгенерировать выбранный'}
            </button>
            <button
              type="button"
              className="ghost ghost--light"
              onClick={handleGenerateAll}
              disabled={isLoading}
            >
              Сгенерировать все промты
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="card result">
          <div className="result__header">
            <h2>Ответ модели</h2>
            <div className="result__controls">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={persistHistory}
                  onChange={(event) => {
                    const value = event.target.checked
                    setPersistHistory(value)
                    if (!value) setResults([])
                  }}
                />
                <span>Сохранять историю</span>
              </label>
              <button
                type="button"
                className="ghost ghost--dark"
                onClick={handleClearHistory}
                disabled={!results.length}
              >
                Очистить историю
              </button>
            </div>
          </div>
          {results.length ? (
            <div className="result__stack">
              {results.map((entry) => (
                <article key={entry.id} className="result__content">
                  <div className="result__meta">
                    <h3>{entry.label}</h3>
                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="result__text">{entry.content}</div>
                </article>
              ))}
            </div>
          ) : (
            <p className="hint">
              Ответ появится здесь после запроса. Используйте модель на
              OpenRouter или просто скопируйте промт.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
