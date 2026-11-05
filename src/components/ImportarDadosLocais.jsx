import { useState } from 'react';
import { CATEGORIAS_RENOMEADAS, STORAGE_KEY, STORAGE_KEY_LIMITES } from '../constants';
import { supabase } from '../lib/supabase';

// Dados da versão antiga do app, que guardava tudo no localStorage
function lerDadosLocais() {
  const ler = (chave) => {
    try {
      return JSON.parse(localStorage.getItem(chave));
    } catch {
      return null;
    }
  };
  const t = ler(STORAGE_KEY);
  const l = ler(STORAGE_KEY_LIMITES);
  const transacoes = Array.isArray(t) ? t.filter((x) => x && x.descricao && Number(x.valor) > 0 && x.data) : [];
  const limites = l && typeof l === 'object' && !Array.isArray(l) ? Object.entries(l).filter(([, v]) => Number(v) > 0) : [];
  return { transacoes, limites };
}

function apagarDadosLocais() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY_LIMITES);
}

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

export default function ImportarDadosLocais({ userId, onImportado }) {
  const [dados, setDados] = useState(lerDadosLocais);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [concluido, setConcluido] = useState('');

  const total = dados.transacoes.length + dados.limites.length;
  if (concluido) {
    return (
      <div className="aviso-importar" role="status">
        <span>
          <span aria-hidden="true">✓</span> {concluido}
        </span>
        <button type="button" className="link" onClick={() => setConcluido('')}>
          Fechar
        </button>
      </div>
    );
  }
  if (!total) return null;

  const descricao = [
    dados.transacoes.length && plural(dados.transacoes.length, 'transação', 'transações'),
    dados.limites.length && plural(dados.limites.length, 'limite mensal', 'limites mensais'),
  ]
    .filter(Boolean)
    .join(' e ');

  const importar = async () => {
    setEnviando(true);
    setErro('');
    const linhas = dados.transacoes.map((t) => ({
      user_id: userId,
      tipo: t.tipo === 'renda' ? 'renda' : 'despesa',
      descricao: String(t.descricao),
      valor: Math.round(Number(t.valor) * 100) / 100,
      categoria: CATEGORIAS_RENOMEADAS[t.categoria] || t.categoria || 'Outros',
      data: t.data,
    }));
    const limites = dados.limites.map(([mes, valor]) => ({ user_id: userId, mes, valor: Number(valor) }));

    const r1 = linhas.length ? await supabase.from('transacoes').insert(linhas) : {};
    const r2 = !r1.error && limites.length ? await supabase.from('limites').upsert(limites) : {};
    setEnviando(false);

    if (r1.error || r2.error) {
      // Se só os limites falharem, as transações já foram: não podem ser importadas de novo
      if (!r1.error && linhas.length) {
        localStorage.removeItem(STORAGE_KEY);
        setDados((d) => ({ ...d, transacoes: [] }));
        onImportado();
      }
      return setErro('Não foi possível importar tudo. Verifique sua conexão e tente de novo.');
    }
    apagarDadosLocais();
    setDados({ transacoes: [], limites: [] });
    setConcluido(`Pronto! Importamos ${descricao} para a sua conta.`);
    onImportado();
  };

  const descartar = () => {
    if (!window.confirm(`Apagar ${descricao} deste navegador sem importar? Essa ação não pode ser desfeita.`)) return;
    apagarDadosLocais();
    setDados({ transacoes: [], limites: [] });
  };

  return (
    <section className="aviso-importar" aria-label="Importar dados deste navegador">
      <div>
        <p>
          Encontramos <strong>{descricao}</strong> da versão anterior do app neste navegador. Quer enviar para a sua
          conta?
        </p>
        {erro && (
          <span className="erro" role="alert">
            {erro}
          </span>
        )}
      </div>
      <div className="aviso-acoes">
        <button type="button" className="botao-principal" onClick={importar} disabled={enviando}>
          {enviando ? 'Importando…' : 'Importar'}
        </button>
        <button type="button" className="botao-secundario" onClick={descartar} disabled={enviando}>
          Descartar
        </button>
      </div>
    </section>
  );
}
