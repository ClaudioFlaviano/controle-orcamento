import { useEffect, useState } from 'react';
import { STORAGE_KEY_LIMITES } from '../constants';

// Limites de orçamento por mês: { 'YYYY-MM': valor }
function carregar() {
  try {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY_LIMITES));
    return dados && typeof dados === 'object' && !Array.isArray(dados) ? dados : {};
  } catch {
    return {};
  }
}

export function useBudgets() {
  const [limites, setLimites] = useState(carregar);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LIMITES, JSON.stringify(limites));
  }, [limites]);

  const definirLimite = (mes, valor) => setLimites((l) => ({ ...l, [mes]: valor }));
  const removerLimite = (mes) =>
    setLimites((l) => {
      const { [mes]: _, ...resto } = l;
      return resto;
    });

  return { limites, definirLimite, removerLimite };
}
