# Testes E2E

Suíte end-to-end full-stack. O Playwright dirige o navegador para o
**backend real**, então o backend precisa estar no ar antes de rodar.

## Pré-requisitos

No repositório do backend (`2026-1-RetinaScan-Api`):

```bash
docker compose -f docker-compose.dev.yml up -d
npm run dev
```

O `npm run dev` do backend cria o **admin default** usado nos testes
(`admin@retinascan.local`). Confirme que existe `env/.env.dev` com as
variáveis `ADMIN_*` (ver `env/.env.example`).

> A senha usada nos testes precisa bater com `ADMIN_PASSWORD` do backend.
> O default (`SenhaMuitoForte123`, do `env/.env.example`) já é assumido; se o
> seu backend usa outra senha, exporte `E2E_ADMIN_PASSWORD` (ver abaixo).

O `VITE_API_URL` que o front consome nos testes tem default `http://localhost:3000`
(injetado pelo `webServer` em `playwright.config.ts`) — **não precisa configurar
`.env` no front**. Sobrescreva com `VITE_API_URL=...` se a API estiver em outro host.

## Rodar

```bash
npm run test:e2e # headless
npm run test:e2e:ui # modo interativo
npm run test:e2e:report
```
