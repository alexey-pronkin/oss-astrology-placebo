# Astrology Placebo Lab

[English version](./README.md)

Astrology Placebo Lab — это интерфейс на Vite + React для генерации промтов о совместимости пары. Приложение поддерживает один честный научный шаблон и несколько намеренно символических псевдо-астрологических стилей. Все запросы идут через локальный OpenRouter proxy внутри Vite dev server.

## Возможности

- Генерация одного выбранного шаблона или всего набора.
- Сохранение состояния интерфейса в `localStorage` без сохранения API-ключей.
- Валидация `.env`-дефолтов для даты и времени рождения.
- Проксирование OpenRouter-запросов через локальный сервер с маскированными stdout-логами.
- Docker Compose стек с `web`, `traefik` и `crowdsec`.
- Подготовленный шов расширения для будущих источников контекста вроде сервиса "альбом воспоминаний".

## Архитектура

Рефактор намеренно держит приложение небольшим и явным:

- `src/App.jsx`: только orchestration.
- `src/components/`: презентационные секции.
- `src/lib/env.js`: парсинг и нормализация env.
- `src/lib/contextSources.js`: композиция источников контекста.
- `src/lib/promptTemplates.js`: каталог и сборка промтов.
- `src/lib/openRouter.js`: запросы в локальный proxy.
- `src/lib/persistence.js`: сохранение состояния.
- `src/content/appText.js`: локализованные UI-строки.

Точка расширения под новые источники контекста — `buildContextSources(...)`. Сейчас она использует только текст из textarea, но позже может принимать нормализованные внешние источники без переписывания prompt builders и state management.

## Локальный запуск

1. Установите зависимости:

```bash
npm install
```

2. Скопируйте шаблон env:

```bash
cp example.env .env
```

3. Минимально задайте:

```env
OPENROUTER_API_KEY=<openrouter-api-key>
```

4. Запустите приложение:

```bash
npm run dev
```

Dev server пишет в stdout валидированные env-дефолты и lifecycle лог запросов с маскированием токенов.

5. Установите локальный pre-commit hook:

```bash
npm run precommit:install
```

Hook сканирует staged-файлы на токеноподобные секреты перед каждым commit. Ручной запуск:

```bash
npm run secrets:scan
```

## Переменные окружения

Основные переменные:

```env
VITE_FEMALE_DATE=25.10.1990
VITE_FEMALE_TIME=04:00:00am
VITE_MALE_DATE=25.08.1993
VITE_MALE_TIME=22:00

OPENROUTER_API_KEY=<openrouter-api-key>
OPENROUTER_API_KEY_FILE=./secrets/openrouter_api_key
APP_HOSTNAME=astro.localhost
TRAEFIK_ACME_EMAIL=admin@example.com
TRAEFIK_HTTP_PORT=80
TRAEFIK_HTTPS_PORT=443
CROWDSEC_BOUNCER_KEY=replace-with-long-random-string
CONTAINER_WEB_PORT=5173
```

Поддерживаемые форматы даты:

- `DD.MM.YYYY`
- `YYYY-MM-DD`

Поддерживаемые форматы времени:

- `HH:MM[:SS][am|pm]`
- `HH:MM` в 24-часовом формате

## Docker Compose

В compose-стек входят:

- `web`: Vite dev server и OpenRouter proxy.
- `traefik`: reverse proxy с TLS и Docker labels.
- `crowdsec`: парсер логов и appsec-сервис для Traefik bouncer plugin.

Минимальные значения `.env` для reverse proxy стека:

```env
APP_HOSTNAME=astro.example.com
TRAEFIK_ACME_EMAIL=ops@example.com
CROWDSEC_BOUNCER_KEY=replace-with-long-random-string
```

Сгенерируйте не-placeholder CrowdSec bouncer key с символами:

```bash
openssl rand -base64 48 | tr -d '\n'
```

`docker compose up` всегда сначала запускает `secrets-validator`. Стек не поднимется, если:

- `OPENROUTER_API_KEY` отсутствует, слишком короткий, не похож на OpenRouter key или остался placeholder.
- `CROWDSEC_BOUNCER_KEY` отсутствует, короче 32 символов, низкоэнтропийный или не содержит символов.
- tracked-файлы содержат токеноподобные OpenRouter-секреты.

Запуск:

```bash
docker compose up
```

## Проверки

Запустите quality gates:

```bash
npm run lint
npm run test
npm run build
npm run secrets:scan
npm run secrets:validate:container
docker compose config
```

## Шаблоны промтов

- `scientific`: честный научный анализ совместимости.
- `astro-quantum`: псевдо-клиническая астрологическая пародия.
- `tarot-full-stack`: театральная таро-пародия.
- `natal-matrix`: псевдо-технический эзотерический отчёт.

## Безопасность

- API-ключи не сохраняются в `localStorage`.
- Браузер обращается только к `/api/openrouter/chat/completions`.
- Dev и proxy логи маскируют токеноподобные секреты перед выводом.
- Pre-commit secret scan проверяет staged blobs прямо из git index.
- Docker Compose заблокирован validation container перед запуском app-сервисов.

## Лицензия

MIT
