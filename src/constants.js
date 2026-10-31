export const CATEGORIAS_DESPESA = [
  'Alimentação',
  'Aluguel',
  'Condomínio',
  'Financiamento',
  'Contas (água/luz/gás/internet)',
  'Transporte',
  'Saúde',
  'Educação',
  'Entretenimento',
  'Compras',
  'Dízimo',
  'Ofertas',
  'Doações',
  'Outros',
];

export const CATEGORIAS_RENDA = ['Salário', 'Freelance', 'Investimentos', 'Outros'];

// Categorias que mudaram de nome: transações antigas são atualizadas ao carregar
export const CATEGORIAS_RENOMEADAS = {
  'Contas (água/luz/internet)': 'Contas (água/luz/gás/internet)',
};

export const STORAGE_KEY = 'orcamento.transacoes';
export const STORAGE_KEY_LIMITES = 'orcamento.limites';
