import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Limites de orçamento por mês: { 'YYYY-MM': valor }
export function useBudgets(userId) {
  const [limites, setLimites] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [versao, setVersao] = useState(0);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => {
    // "carregando" só vale para a primeira carga; recargas trocam os dados sem esconder a tela
    let ativo = true;
    supabase
      .from('limites')
      .select('mes, valor')
      .then(({ data, error }) => {
        if (!ativo) return;
        if (error) setErro('Não foi possível carregar seus limites de orçamento.');
        else setLimites(Object.fromEntries(data.map((l) => [l.mes, Number(l.valor)])));
        setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [userId, versao]);

  // As mudanças aparecem na hora; se o banco recusar, recarregamos e avisamos
  const definirLimite = async (mes, valor) => {
    setLimites((l) => ({ ...l, [mes]: valor }));
    const { error } = await supabase.from('limites').upsert({ user_id: userId, mes, valor });
    if (error) {
      setErro('Não foi possível salvar o limite. Tente de novo.');
      recarregar();
    }
  };

  const removerLimite = async (mes) => {
    setLimites((l) => {
      const { [mes]: _, ...resto } = l;
      return resto;
    });
    const { error } = await supabase.from('limites').delete().eq('mes', mes);
    if (error) {
      setErro('Não foi possível remover o limite. Tente de novo.');
      recarregar();
    }
  };

  return { limites, definirLimite, removerLimite, carregando, erro, limparErro: () => setErro(''), recarregar };
}
