const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const porcentagem = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });

export const formatarMoeda = (valor) => moeda.format(valor);
export const formatarPorcentagem = (fracao) => porcentagem.format(fracao);

// 'YYYY-MM-DD' -> 'DD/MM/YYYY' (sem passar por Date, evitando problemas de fuso)
export const formatarData = (iso) => {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
};

export const hojeISO = () => {
  const h = new Date();
  const mm = String(h.getMonth() + 1).padStart(2, '0');
  const dd = String(h.getDate()).padStart(2, '0');
  return `${h.getFullYear()}-${mm}-${dd}`;
};

// Aceita "1.234,56", "1234,56", "1.000" (mil) ou "1234.56"
export function lerValor(texto) {
  const t = String(texto).trim().replace(/^R\$\s*/, '');
  if (t.includes(',')) return Number(t.replace(/\./g, '').replace(',', '.'));
  // Só pontos agrupando milhares (ex.: "1.000", "12.500.000") = separador de milhar
  if (/^\d{1,3}(\.\d{3})+$/.test(t)) return Number(t.replace(/\./g, ''));
  return Number(t);
}

export const mesAtualISO = () => hojeISO().slice(0, 7);

// 'YYYY-MM' -> 'outubro de 2026'
export const formatarMes = (mes) => {
  const [a, m] = mes.split('-').map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

// Soma 'delta' meses a 'YYYY-MM'
export const somarMes = (mes, delta) => {
  const [a, m] = mes.split('-').map(Number);
  const d = new Date(a, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
