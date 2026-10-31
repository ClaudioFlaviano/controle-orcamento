import { useState } from 'react';
import { CATEGORIAS_DESPESA, CATEGORIAS_RENDA } from '../constants';
import { hojeISO, lerValor } from '../utils/format';

const vazio = (tipo) => ({
  tipo,
  descricao: '',
  valor: '',
  categoria: tipo === 'renda' ? CATEGORIAS_RENDA[0] : CATEGORIAS_DESPESA[0],
  data: hojeISO(),
});

export default function TransactionForm({ onAdicionar }) {
  const [form, setForm] = useState(vazio('despesa'));
  const [erro, setErro] = useState('');
  const categorias = form.tipo === 'renda' ? CATEGORIAS_RENDA : CATEGORIAS_DESPESA;

  const mudar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const trocarTipo = (tipo) => setForm({ ...vazio(tipo), data: form.data });

  const enviar = (e) => {
    e.preventDefault();
    const valor = lerValor(form.valor);
    if (!form.descricao.trim()) return setErro('Informe uma descrição.');
    if (!Number.isFinite(valor) || valor <= 0) return setErro('Informe um valor maior que zero.');
    if (!form.data) return setErro('Informe a data.');
    onAdicionar({ ...form, descricao: form.descricao.trim(), valor: Math.round(valor * 100) / 100 });
    setErro('');
    setForm({ ...vazio(form.tipo), categoria: form.categoria, data: form.data });
  };

  return (
    <form className="painel form" onSubmit={enviar}>
      <h2>Nova transação</h2>

      <div className="segmentado" role="group" aria-label="Tipo">
        <button type="button" className={form.tipo === 'despesa' ? 'ativo' : ''} onClick={() => trocarTipo('despesa')}>
          Despesa
        </button>
        <button type="button" className={form.tipo === 'renda' ? 'ativo' : ''} onClick={() => trocarTipo('renda')}>
          Renda
        </button>
      </div>

      <label>
        Descrição
        <input value={form.descricao} onChange={mudar('descricao')} placeholder="Ex.: Supermercado" />
      </label>

      <div className="linha">
        <label>
          Valor (R$)
          <input inputMode="decimal" value={form.valor} onChange={mudar('valor')} placeholder="0,00" />
        </label>
        <label>
          Data
          <input type="date" value={form.data} onChange={mudar('data')} />
        </label>
      </div>

      <label>
        Categoria
        <select value={form.categoria} onChange={mudar('categoria')}>
          {categorias.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      {erro && (
        <p className="erro" role="alert">
          {erro}
        </p>
      )}

      <button type="submit" className="botao-principal">
        Adicionar {form.tipo === 'renda' ? 'renda' : 'despesa'}
      </button>
    </form>
  );
}
