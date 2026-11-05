# Controle de Orçamento

Aplicativo web para controle de orçamento pessoal. Registre suas rendas e despesas por categoria, acompanhe o saldo e veja para onde o seu dinheiro está indo.

## Funcionalidades

- **Conta de usuário**: cadastro com e-mail e senha ou login com Google, com recuperação de senha. Os dados ficam na nuvem e aparecem em qualquer dispositivo.
- **Rendas e despesas**: cadastro com descrição, valor, data e categoria. Aceita valores no formato brasileiro (`1.234,56`).
- **Painel de resumo**: renda total, despesas totais e saldo restante, que fica vermelho quando você gasta mais do que ganha.
- **Orçamento mensal**: defina um limite de gastos para cada mês e acompanhe por uma barra de progresso. A barra fica vermelha quando o limite é ultrapassado.
- **Gastos por categoria**: gráfico de barras ordenado do maior para o menor gasto, com valor e porcentagem de cada categoria.
- **Lista de transações**: filtro por Todas / Rendas / Despesas e exclusão com confirmação.
- **Tema claro e escuro** automático, conforme a configuração do sistema, e layout adaptado para celular.

### Categorias

- **Despesas**: Alimentação, Aluguel, Condomínio, Financiamento, Contas (água/luz/gás/internet), Transporte, Saúde, Educação, Entretenimento, Compras, Dízimo, Ofertas, Doações e Outros.
- **Rendas**: Salário, Freelance, Investimentos e Outros.

## Como executar

Requisito: [Node.js](https://nodejs.org/) 20.19 ou superior, além de um projeto Supabase configurado (veja abaixo).

```bash
npm install                 # instala as dependências
cp .env.example .env.local  # depois preencha com os dados do Supabase
npm run dev                 # inicia em http://localhost:5173
```

Outros comandos:

```bash
npm run build    # gera a versão de produção em dist/
npm run preview  # serve a versão de produção localmente
```

## Onde os dados ficam salvos

No [Supabase](https://supabase.com/) (banco Postgres e login), no plano gratuito. Regras de segurança do banco (RLS) garantem que cada usuário só vê os próprios dados. Quem usava a versão antiga, que salvava no navegador, recebe uma oferta para importar esses dados depois do primeiro login.

## Configuração (uma vez só)

### 1. Supabase

1. Crie um projeto gratuito em [supabase.com](https://supabase.com/) (região *South America (São Paulo)*).
2. Em **SQL Editor → New query**, cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**.
3. Em **Project Settings → API**, copie a *Project URL* e a chave *anon public* para o `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. Em **Authentication → URL Configuration**:
   - **Site URL**: o endereço do app no Vercel (ex.: `https://controle-orcamento.vercel.app`)
   - **Redirect URLs**: `http://localhost:5173` e o endereço do Vercel

### 2. Login com Google

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto e configure a **OAuth consent screen** (tipo *External*).
2. Em **Credentials → Create credentials → OAuth client ID**, escolha *Web application* e, em **Authorized redirect URIs**, adicione `https://xxxx.supabase.co/auth/v1/callback` (o endereço do seu projeto Supabase).
3. No Supabase, em **Authentication → Providers → Google**, ative e cole o *Client ID* e o *Client secret*.

### 3. Publicar no Vercel (grátis)

1. Em [vercel.com](https://vercel.com/), clique em **Add New → Project** e importe este repositório do GitHub. O Vercel reconhece o Vite sozinho.
2. Em **Environment Variables**, cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Clique em **Deploy**. A partir daí, cada `git push` na `main` publica uma versão nova.

### 4. Manter o Supabase ativo (recomendado)

O plano gratuito pausa o projeto depois de 7 dias sem acesso. Para evitar isso, cadastre os secrets `SUPABASE_URL` e `SUPABASE_ANON_KEY` em **GitHub → Settings → Secrets and variables → Actions**. O workflow [`manter-ativo.yml`](.github/workflows/manter-ativo.yml) faz uma consulta a cada 3 dias.

### Limites do plano gratuito

- Supabase: 500 MB de banco e 50 mil usuários ativos por mês. O envio de e-mails (confirmação de conta e recuperação de senha) pelo servidor padrão é limitado a poucos por hora. Para mais, configure um SMTP próprio em **Authentication → Emails**.
- Vercel Hobby: só para uso pessoal, sem fins comerciais.

## Tecnologias

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/)
- [Supabase](https://supabase.com/) (Postgres e autenticação)
- CSS puro (sem framework), sem biblioteca de gráficos

## Estrutura

```
src/
  App.jsx            # login ou painel; liga os dados aos componentes
  components/        # login, painel, orçamento mensal, formulário, gráfico, lista e importação
  hooks/             # login (useAuth) e estado das transações e dos limites, salvos no Supabase
  lib/supabase.js    # cliente do Supabase
  utils/format.js    # formatação de moeda, datas e leitura de valores
  constants.js       # categorias e chaves antigas do localStorage
supabase/schema.sql  # tabelas e regras de segurança do banco
```
