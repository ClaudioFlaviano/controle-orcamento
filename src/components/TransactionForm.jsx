import { useId, useRef, useState } from 'react';
import { CATEGORIAS_DESPESA, CATEGORIAS_RENDA } from '../constants';
import { formatarMoeda, hojeISO, lerValor } from '../utils/format';

const vazio = (tipo) => ({
  tipo,
  descricao: '',
  valor: '',
  categoria: tipo === 'renda' ? CATEGORIAS_RENDA[0] : CATEGORIAS_DESPESA[0],
  data: hojeISO(),
});

export default function TransactionForm({ onAdicionar }) {
  const id = useId();
  const refs = { descricao: useRef(null), valor: useRef(null), data: useRef(null) };
  const [form, setForm] = useState(vazio('despesa'));
  // Erro ligado a um campo: { campo, mensagem }
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState('');
  const categorias = form.tipo === 'renda' ? CATEGORIAS_RENDA : CATEGORIAS_DESPESA;

  const mudar = (campo) => (e) => {
    setForm({ ...form, [campo]: e.target.value });
    if (erro?.campo === campo) setErro(null);
    setSucesso('');
  };

  const trocarTipo = (tipo) => {
    setForm({ ...vazio(tipo), data: form.data });
    setErro(null);
    setSucesso('');
  };

  const falhar = (campo, mensagem) => {
    setErro({ campo, mensagem });
    setSucesso('');
    refs[campo].current?.focus();
  };

  const enviar = (e) => {
    e.preventDefault();
    const valor = lerValor(form.valor);
    const descricao = form.descricao.trim();
    if (!descricao) return falhar('descricao', 'Informe uma descrição.');
    if (!Number.isFinite(valor) || valor <= 0) return falhar('valor', 'Informe um valor maior que zero, por exemplo 25,90.');
    if (!form.data) return falhar('data', 'Informe a data.');
    const valorFinal = Math.round(valor * 100) / 100;
    onAdicionar({ ...form, descricao, valor: valorFinal });
    setErro(null);
    setSucesso(`${form.tipo === 'renda' ? 'Renda' : 'Despesa'} “${descricao}” de ${formatarMoeda(valorFinal)} adicionada.`);
    setForm({ ...vazio(form.tipo), categoria: form.categoria, data: form.data });
    refs.descricao.current?.focus();
  };

  // Atributos de acessibilidade do campo com erro
  const atributosErro = (campo) =>
    erro?.campo === campo ? { 'aria-invalid': true, 'aria-describedby': `${id}-${campo}-erro` } : {};

  // Mensagem de erro logo abaixo do campo
  const mensagemErro = (campo) =>
    erro?.campo === campo && (
      <span id={`${id}-${campo}-erro`} className="erro" role="alert">
        {erro.mensagem}
      </span>
    );

  return (
    <form className="painel form" onSubmit={enviar} noValidate>
      <h2>Nova transação</h2>

      <div className="segmentado" role="group" aria-label="Tipo de transação">
        {['despesa', 'renda'].map((tipo) => (
          <button
            key={tipo}
            type="button"
            className={form.tipo === tipo ? 'ativo' : ''}
            aria-pressed={form.tipo === tipo}
            onClick={() => trocarTipo(tipo)}
          >
            {tipo === 'renda' ? 'Renda' : 'Despesa'}
          </button>
        ))}
      </div>

      <label>
        Descrição
        <input
          ref={refs.descricao}
          value={form.descricao}
          onChange={mudar('descricao')}
          placeholder={form.tipo === 'renda' ? 'Ex.: Salário' : 'Ex.: Supermercado'}
          autoComplete="off"
          {...atributosErro('descricao')}
        />
        {mensagemErro('descricao')}
      </label>

      <div className="linha">
        <label>
          Valor (R$)
          <input
            ref={refs.valor}
            inputMode="decimal"
            value={form.valor}
            onChange={mudar('valor')}
            placeholder="0,00"
            autoComplete="off"
            {...atributosErro('valor')}
          />
          {mensagemErro('valor')}
        </label>
        <label>
          Data
          <input ref={refs.data} type="date" value={form.data} onChange={mudar('data')} {...atributosErro('data')} />
          {mensagemErro('data')}
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

      <button type="submit" className="botao-principal">
        Adicionar {form.tipo === 'renda' ? 'renda' : 'despesa'}
      </button>

      <p className="sucesso" role="status">
        {sucesso && (
          <>
            <span aria-hidden="true">✓</span> {sucesso}
          </>
        )}
      </p>
    </form>
  );
}
