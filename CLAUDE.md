# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal budget tracker (React 19 + Vite, plain JavaScript). Data and login live in **Supabase**; the app is a static SPA hosted on Vercel (free Hobby plan), with no server of its own. The UI, identifiers, and user-facing text are in **Brazilian Portuguese** (e.g. `transacoes`, `adicionar`, `formatarMoeda`); keep new code consistent with that. Currency is BRL, formatted with `pt-BR`.

## Commands

- `npm run dev` — dev server (the user runs it on port 5173)
- `npm run build` — production build to `dist/`; this is the only automated check (no linter or test suite is configured). Without the `VITE_SUPABASE_*` env vars Vite drops the Supabase code as dead code, so to check the real bundle build with them set (dummy values are fine)
- `npm run preview` — serve the built `dist/`

## Git: commit e push a cada mudança

O usuário quer poder voltar tudo ao normal sempre que algo der errado. Por isso:

- Faça commit no git de **todas** as mudanças, com uma mensagem clara em português que diga o que mudou e por quê.
- Um commit por mudança lógica. Não junte alterações sem relação no mesmo commit.
- Antes de cada commit, rode `npm run build` (o projeto ainda não tem testes; se um dia tiver, rode `npm test` também). Só faça commit se passar, para que todo ponto do histórico seja uma versão que funciona.
- Envie (`git push`) para `origin main` logo após cada commit. Repositório (privado): https://github.com/ClaudioFlaviano/controle-orcamento
- Não é preciso pedir permissão para commitar ou enviar.
- Se algo der errado, ofereça restaurar uma versão anterior. Prefira `git revert` (que mantém o histórico) a reescrever o histórico (`reset --hard`, `push --force`), e só reescreva com autorização explícita.

## Architecture

- **Supabase (Postgres + Auth), called straight from the browser.** The client is in `src/lib/supabase.js` and reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (`.env.local` locally, Environment Variables on Vercel; see `.env.example`). The anon key is public. Security comes from the **RLS** policies in `supabase/schema.sql`: each user only reads and writes rows where `user_id = auth.uid()`. Any new table needs RLS and a policy like these. Schema changes go in `supabase/schema.sql` and must be run by hand in the Supabase SQL Editor.
  - `transacoes`: `{ id uuid, user_id, tipo: 'renda'|'despesa', descricao, valor numeric(12,2), categoria, data date, criado_em }`
  - `limites`: `{ user_id, mes 'YYYY-MM', valor }`, with primary key `(user_id, mes)`
  - `numeric` comes back as a string, so convert it with `Number()` on load. `date` comes back as `'YYYY-MM-DD'`.
- **Auth**: `src/hooks/useAuth.js` covers email/password, Google OAuth, password recovery (the `PASSWORD_RECOVERY` event shows `NovaSenha`), and translates Supabase error messages to Portuguese. `App.jsx` gates the UI. It shows `FaltaConfiguracao` when env vars are missing, `Login` when there is no session, and `Painel` when signed in.
- **Each store is a custom hook** (`src/hooks/useTransactions.js`, `src/hooks/useBudgets.js`) that receives `userId`, loads from Supabase, and applies changes **optimistically**: it updates state first, then writes, and on error rolls back or reloads and sets `erro`, which `Painel` shows in an `.alerta` banner. `carregando` is true only for the first load, and `recarregar()` refetches without hiding the UI. Transactions are fetched in pages of 1000, the PostgREST row cap. `Painel` calls both hooks and passes data and callbacks down as props; there is no context or global store.
- **Legacy localStorage data**: the old keys `orcamento.transacoes` / `orcamento.limites` (in `src/constants.js`) are read only by `ImportarDadosLocais`, which offers a one-time import into the account and then deletes them.
- **Derived numbers are computed, never stored**: `useTransactions` returns the all-time totals (renda, despesas, saldo) and the per-category spending, sorted largest first. `MonthlyBudget` filters expenses by the `YYYY-MM` prefix of `data` for the selected month. The summary cards, category chart, and transaction list are all-time; only the monthly budget panel is month-scoped.
- **Categories** are fixed lists in `src/constants.js`. If you rename a category, add an `old → new` entry to `CATEGORIAS_RENOMEADAS`. It is applied when loading from the database and when importing local data. To migrate stored rows permanently, also run an `update` in Supabase.
- **Dates and money parsing**: dates are handled as `YYYY-MM-DD` strings. Avoid `new Date('YYYY-MM-DD')`, which parses as UTC and shifts the day. Use the helpers in `src/utils/format.js`. `lerValor` parses user input in Brazilian format: comma is the decimal separator, and a dot-only grouping like `"1.000"` means one thousand.
- **Styling** is one global `src/index.css` that uses CSS custom properties, with a `prefers-color-scheme: dark` override. The category chart is plain HTML/CSS horizontal bars (ranked, single hue), not a charting library. The budget bar turns red (`.estourado`) when spending exceeds the limit.
- **Free-tier upkeep**: Supabase Free pauses a project after 7 days without requests. `.github/workflows/manter-ativo.yml` pings the API every 3 days, using the `SUPABASE_URL` / `SUPABASE_ANON_KEY` repo secrets.
