# Astrology Placebo Lab

Чистый и понятный веб-интерфейс для генерации промтов о совместимости.
Есть два режима: научный (честный) и псевдонаучные астрологические стили.
Работает через OpenRouter API и умеет сравнивать разные генерации.

---

## Release Notes (draft)

Astrology Placebo Lab ships a Vite + React web UI for generating relationship‑compatibility prompts in two modes: a rigorous, science‑honest template and multiple pseudo‑astrology styles (astro‑quantum, tarot full‑stack, natal matrix). The app integrates OpenRouter, supports single or batch prompt generation, and keeps a browsable history with optional persistence. It also includes env parsing with friendly warnings, a Docker Compose setup using secrets and a randomized host port, and a refreshed README for vibecoders.

---

## Что это делает

- Формирует научно-ориентированный промт (с честной оговоркой про астрологию).
- Даёт выбор псевдонаучных промтов (натальные термины, таро, техно-эзотерика).
- Отправляет запросы в LLM через OpenRouter.
- Сохраняет историю результатов (опционально).
- Показывает промт и ответы в одном экране.

---

## Быстрый старт (локально)

1) Установить зависимости:

```bash
npm install
```

2) Скопировать и настроить переменные:

```bash
cp example.env .env
```

3) Запуск:

```bash
npm run dev
```

Откройте адрес, который покажет Vite (обычно http://localhost:5173).

---

## Настройка OpenRouter

Есть два варианта:

### Вариант 1 — просто (ключ прямо в .env)

В `.env`:

```
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key
```

### Вариант 2 — безопаснее (Docker secrets)

1) Создайте файл:

```
secrets/openrouter_api_key
```

2) Внутри файла — только ключ, без пробелов и кавычек.

3) Запускайте через docker compose (см. ниже).

---

## Docker Compose

Проект готов к запуску в Docker без установки Node.js.

1) Скопируйте env:

```bash
cp example.env .env
```

2) (Опционально) Положите ключ в файл:

```
secrets/openrouter_api_key
```

3) Запуск:

```bash
docker compose up
```

По умолчанию используется не стандартный порт.
Порт можно изменить в `.env`:

```
HOST_WEB_PORT=18473
CONTAINER_WEB_PORT=5173
```

Откройте:

```
http://localhost:18473
```

---

## Промты

В интерфейсе есть несколько шаблонов:

- **Научный (честный)** — эмпиричный, осторожный, без мистики.
- **Astro-Quantum Synastry** — псевдонаучная “диагностика”.
- **Tarot Full-Stack** — полный канон таро + расклад.
- **Natal Matrix** — техно-эзотерическая “матрица”.

Вы можете:
- Сгенерировать только один выбранный промт.
- Сгенерировать ответы сразу на все промты.

---

## Переменные окружения

Пример в `example.env`:

```
VITE_FEMALE_DATE=25.10.1990
VITE_FEMALE_TIME=04:00:00am
VITE_MALE_DATE=25.08.1993
VITE_MALE_TIME=22:00:00pm

VITE_OPENROUTER_API_KEY=sk-or-v1-example
HOST_WEB_PORT=18473
CONTAINER_WEB_PORT=5173
OPENROUTER_API_KEY_FILE=./secrets/openrouter_api_key
```

Формат времени:
- `HH:MM:SSam` или `HH:MM:SSpm`

Формат даты:
- `DD.MM.YYYY`

Если формат неверный — интерфейс покажет предупреждение.

---

## История и приватность

По умолчанию история сохраняется в `localStorage` браузера.
Можно отключить это переключателем “Сохранять историю”.

Ключ OpenRouter:
- либо хранится в `.env` (просто)
- либо в Docker secret (безопаснее)

---

## Частые проблемы

**Нет ответа от модели**
- Проверьте ключ `VITE_OPENROUTER_API_KEY`.
- Проверьте название модели (по умолчанию `openai/o1`).

**Поля даты не заполняются**
- Формат даты должен быть `DD.MM.YYYY`.

**Поля времени не заполняются**
- Формат времени `HH:MM:SSam` или `HH:MM:SSpm`.

---

## Стек

- Vite
- React
- OpenRouter API

---

## Лицензия

MIT (если хотите — замените на вашу).
