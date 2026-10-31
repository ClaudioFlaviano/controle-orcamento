import { useEffect, useMemo, useState } from 'react';
import { CATEGORIAS_RENOMEADAS, STORAGE_KEY } from '../constants';

function carregar() {
  try {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(dados)) return [];
    return dados.map((t) => ({ ...t, categoria: CATEGORIAS_RENOMEADAS[t.categoria] || t.categoria }));
  } catch {
    return [];
  }
}

export function useTransactions() {
  const [transacoes, setTransacoes] = useState(carregar);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
  }, [transacoes]);

  const adicionar = (t) => setTransacoes((lista) => [{ ...t, id: crypto.randomUUID() }, ...lista]);
  const remover = (id) => setTransacoes((lista) => lista.filter((t) => t.id !== id));

  const resumo = useMemo(() => {
    let renda = 0;
    let despesas = 0;
    const porCategoria = {};
    for (const t of transacoes) {
      if (t.tipo === 'renda') {
        renda += t.valor;
      } else {
        despesas += t.valor;
        porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + t.valor;
      }
    }
    const gastosPorCategoria = Object.entries(porCategoria)
      .map(([categoria, valor]) => ({ categoria, valor, fracao: despesas ? valor / despesas : 0 }))
      .sort((a, b) => b.valor - a.valor);
    return { renda, despesas, saldo: renda - despesas, gastosPorCategoria };
  }, [transacoes]);

  return { transacoes, adicionar, remover, ...resumo };
}
