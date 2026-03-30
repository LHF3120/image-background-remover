# Image Background Remover

MVP for image background removal using Cloudflare Workers + Remove.bg API.

## Architecture

```
User Browser → Cloudflare Worker → Remove.bg API → Result
```

## Tech Stack

- **Backend**: Cloudflare Workers (TypeScript)
- **API**: Remove.bg
- **Frontend**: Vanilla HTML/JS (single page)

## Setup

1. Get Remove.bg API key from https://www.remove.bg/api
2. Deploy Worker with `wrangler deploy`
3. Set `REMOVE_BG_API_KEY` as a secret

## Development

```bash
cd worker
npm install
npm run dev
```

## Deploy

```bash
cd worker
wrangler deploy
```
