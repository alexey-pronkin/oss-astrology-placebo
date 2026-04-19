# Astrology Placebo Lab

[Русская версия](./README.ru.md)

Astrology Placebo Lab is a Vite + React interface for generating relationship-compatibility prompts. It supports one science-honest template and several intentionally symbolic pseudo-astrology styles, all sent through an OpenRouter proxy running inside the local Vite dev server.

## Features

- Generates one selected prompt or the whole template set.
- Keeps the UI state in `localStorage` without persisting API keys.
- Validates `.env` defaults for birth date and birth time fields.
- Sends OpenRouter requests through a local proxy with masked stdout logs.
- Ships with Docker Compose for `web`, `traefik`, and `crowdsec`.
- Exposes a clean extension seam for future context providers such as a "memory album" service.

## Architecture

The refactor intentionally keeps the app small and explicit:

- `src/App.jsx`: orchestration only.
- `src/components/`: presentational sections.
- `src/lib/env.js`: env parsing and normalization.
- `src/lib/contextSources.js`: context-source composition.
- `src/lib/promptTemplates.js`: prompt catalog and builders.
- `src/lib/openRouter.js`: request wiring to the local proxy.
- `src/lib/persistence.js`: local state persistence.
- `src/content/appText.js`: localized UI copy.

The future integration point for additional context is `buildContextSources(...)`. Today it uses only the manual textarea; later it can receive normalized external sources without rewriting prompt builders or UI state management.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy the env template:

```bash
cp example.env .env
```

3. Set at least:

```env
OPENROUTER_API_KEY=<openrouter-api-key>
```

4. Start the app:

```bash
npm run dev
```

The dev server logs validated env defaults and masked request lifecycle events to stdout.

5. Install the local pre-commit hook:

```bash
npm run precommit:install
```

The hook scans staged files for token-like secrets before every commit. You can also run the scan manually:

```bash
npm run secrets:scan
```

## Environment Variables

Main variables:

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

Supported date format:

- `DD.MM.YYYY`
- `YYYY-MM-DD`

Supported time format:

- `HH:MM[:SS][am|pm]`
- `HH:MM` in 24-hour time

## Docker Compose

The compose stack contains:

- `web`: the Vite dev server and OpenRouter proxy.
- `traefik`: reverse proxy with TLS and Docker labels.
- `crowdsec`: log parser and appsec service for the Traefik bouncer plugin.

Minimal `.env` values for the reverse proxy stack:

```env
APP_HOSTNAME=astro.example.com
TRAEFIK_ACME_EMAIL=ops@example.com
CROWDSEC_BOUNCER_KEY=replace-with-long-random-string
```

Generate a non-placeholder CrowdSec bouncer key with symbols:

```bash
openssl rand -base64 48 | tr -d '\n'
```

`docker compose up` always runs `secrets-validator` first. The stack will not start when:

- `OPENROUTER_API_KEY` is missing, too short, not OpenRouter-shaped, or still a placeholder.
- `CROWDSEC_BOUNCER_KEY` is missing, shorter than 32 characters, low variety, or has no symbols.
- tracked files contain token-like OpenRouter secrets.

Start the stack:

```bash
docker compose up
```

## Testing and Verification

Run the quality gates:

```bash
npm run lint
npm run test
npm run build
npm run secrets:scan
npm run secrets:validate:container
docker compose config
```

## Prompt Templates

- `scientific`: science-honest relationship analysis.
- `astro-quantum`: pseudo-clinical astrology parody.
- `tarot-full-stack`: theatrical tarot reading parody.
- `natal-matrix`: pseudo-technical esoteric report.

## Security Notes

- API keys are not stored in `localStorage`.
- Browser requests go through `/api/openrouter/chat/completions`.
- Dev and proxy logs mask token-like secrets before printing.
- Pre-commit secret scanning checks staged blobs from the git index.
- Docker Compose is gated by a secrets validation container before app services start.

## License

MIT
