# Controle de Orçamento

Aplicativo web para controle de orçamento pessoal. Registre suas rendas e despesas por categoria, acompanhe o saldo e veja para onde o seu dinheiro está indo.

## Funcionalidades

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

Requisito: [Node.js](https://nodejs.org/) 20.19 ou superior.

```bash
npm install      # instala as dependências
npm run dev      # inicia em http://localhost:5173
```

Outros comandos:

```bash
npm run build    # gera a versão de produção em dist/
npm run preview  # serve a versão de produção localmente
```

## Onde os dados ficam salvos

Não há servidor nem banco de dados: tudo fica salvo no **navegador** (`localStorage`). Isso significa que:

- os dados continuam lá ao fechar e reabrir a página;
- eles **não** aparecem em outro navegador ou computador;
- limpar os dados de navegação apaga as transações e os limites.

## Tecnologias

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/)
- CSS puro (sem framework), sem biblioteca de gráficos

## Estrutura

```
src/
  App.jsx            # monta a página e liga os dados aos componentes
  components/        # painel, orçamento mensal, formulário, gráfico e lista
  hooks/             # estado das transações e dos limites, salvos no localStorage
  utils/format.js    # formatação de moeda, datas e leitura de valores
  constants.js       # categorias e chaves de armazenamento
```
