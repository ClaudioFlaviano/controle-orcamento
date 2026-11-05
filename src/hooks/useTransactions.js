import { useCallback, useEffect, useMemo, useState } from 'react';
import { CATEGORIAS_RENOMEADAS } from '../constants';
import { supabase } from '../lib/supabase';

const COLUNAS = 'id, tipo, descricao, valor, categoria, data';
// O Supabase devolve no máximo 1000 linhas por consulta; buscamos em páginas
const PAGINA = 1000;

// O banco devolve "numeric" como texto: convertemos para número
const normalizar = (t) => ({
  ...t,
  valor: Number(t.valor),
  categoria: CATEGORIAS_RENOMEADAS[t.categoria] || t.categoria,
});

async function carregarTodas() {
  const todas = [];
  for (let inicio = 0; ; inicio += PAGINA) {
    const { data, error } = await supabase
      .from('transacoes')
      .select(COLUNAS)
      .order('data', { ascending: false })
      .order('criado_em', { ascending: false })
      .range(inicio, inicio + PAGINA - 1);
    if (error) throw error;
    todas.push(...data);
    if (data.length < PAGINA) return todas.map(normalizar);
  }
}

export function useTransactions(userId) {
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [versao, setVersao] = useState(0);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => {
    // "carregando" só vale para a primeira carga; recargas trocam os dados sem esconder a tela
    let ativo = true;
    carregarTodas()
      .then((lista) => ativo && setTransacoes(lista))
      .catch(() => ativo && setErro('Não foi possível carregar suas transações. Verifique sua conexão e recarregue a página.'))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [userId, versao]);

  // As mudanças aparecem na hora; se o banco recusar, desfazemos e avisamos
  const adicionar = async (t) => {
    const nova = { ...t, id: crypto.randomUUID() };
    setTransacoes((lista) => [nova, ...lista]);
    const { error } = await supabase.from('transacoes').insert({ ...nova, user_id: userId });
    if (error) {
      setTransacoes((lista) => lista.filter((x) => x.id !== nova.id));
      setErro(`Não foi possível salvar “${t.descricao}”. Tente de novo.`);
    }
  };

  const remover = async (id) => {
    setTransacoes((lista) => lista.filter((t) => t.id !== id));
    const { error } = await supabase.from('transacoes').delete().eq('id', id);
    if (error) {
      setErro('Não foi possível excluir a transação. Tente de novo.');
      recarregar();
    }
  };

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

  return { transacoes, adicionar, remover, carregando, erro, limparErro: () => setErro(''), recarregar, ...resumo };
}
