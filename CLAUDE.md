# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal budget tracker (React 19 + Vite, plain JavaScript, no backend). The UI, identifiers, and user-facing text are in **Brazilian Portuguese** (e.g. `transacoes`, `adicionar`, `formatarMoeda`); keep new code consistent with that. Currency is BRL, formatted with `pt-BR`.

## Commands

- `npm run dev` — dev server (the user runs it on port 5173)
- `npm run build` — production build to `dist/`; this is the only automated check (no linter or test suite is configured)
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

- **No backend; all state lives in `localStorage`.** Two keys, defined in `src/constants.js`:
  - `orcamento.transacoes` — array of `{ id, tipo: 'renda'|'despesa', descricao, valor: number, categoria, data: 'YYYY-MM-DD' }`
  - `orcamento.limites` — object of monthly budget limits `{ 'YYYY-MM': number }`
- **Each store is a custom hook** (`src/hooks/useTransactions.js`, `src/hooks/useBudgets.js`) that lazily loads from localStorage and writes back in a `useEffect` on every change. `App.jsx` calls both hooks and passes data and callbacks down as props; there is no context or global store.
- **Derived numbers are computed, never stored**: `useTransactions` returns the all-time totals (renda, despesas, saldo) and the per-category spending, sorted largest first. `MonthlyBudget` filters expenses by the `YYYY-MM` prefix of `data` for the selected month. The summary cards, category chart, and transaction list are all-time; only the monthly budget panel is month-scoped.
- **Categories** are fixed lists in `src/constants.js`. If you rename a category, add an `old → new` entry to `CATEGORIAS_RENOMEADAS` so existing stored transactions are migrated on load.
- **Dates and money parsing**: dates are handled as `YYYY-MM-DD` strings. Avoid `new Date('YYYY-MM-DD')`, which parses as UTC and shifts the day. Use the helpers in `src/utils/format.js`. `lerValor` parses user input in Brazilian format: comma is the decimal separator, and a dot-only grouping like `"1.000"` means one thousand.
- **Styling** is one global `src/index.css` that uses CSS custom properties, with a `prefers-color-scheme: dark` override. The category chart is plain HTML/CSS horizontal bars (ranked, single hue), not a charting library. The budget bar turns red (`.estourado`) when spending exceeds the limit.
