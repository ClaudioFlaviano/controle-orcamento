import { useId, useState } from 'react';
import { formatarMes, formatarMoeda, formatarPorcentagem, lerValor, mesAtualISO, somarMes } from '../utils/format';

export default function MonthlyBudget({ transacoes, limites, onDefinir, onRemover }) {
  const id = useId();
  const [mes, setMes] = useState(mesAtualISO);
  const [editando, setEditando] = useState(false);
  const [entrada, setEntrada] = useState('');
  const [erro, setErro] = useState('');

  const limite = limites[mes];
  const gasto = transacoes
    .filter((t) => t.tipo === 'despesa' && t.data.startsWith(mes))
    .reduce((soma, t) => soma + t.valor, 0);

  const mudarMes = (delta) => {
    setMes((m) => somarMes(m, delta));
    setEditando(false);
    setErro('');
  };

  const comecarEdicao = () => {
    setEntrada(limite ? String(limite).replace('.', ',') : '');
    setErro('');
    setEditando(true);
  };

  const salvar = (e) => {
    e.preventDefault();
    const valor = lerValor(entrada);
    if (!Number.isFinite(valor) || valor <= 0) return setErro('Informe um valor maior que zero.');
    onDefinir(mes, Math.round(valor * 100) / 100);
    setEditando(false);
    setErro('');
  };

  const mostrarFormulario = editando || !limite;

  return (
    <section className="painel orcamento">
      <div className="orcamento-cabecalho">
        <h2>Orçamento mensal</h2>
        <div className="seletor-mes">
          <button type="button" onClick={() => mudarMes(-1)} aria-label="Mês anterior">
            ‹
          </button>
          <span className="mes-nome">{formatarMes(mes)}</span>
          <button type="button" onClick={() => mudarMes(1)} aria-label="Próximo mês">
            ›
          </button>
          {mes !== mesAtualISO() && (
            <button type="button" className="link" onClick={() => setMes(mesAtualISO())}>
              Hoje
            </button>
          )}
        </div>
      </div>

      {mostrarFormulario ? (
        <form className="orcamento-form" onSubmit={salvar}>
          <label htmlFor={`${id}-limite`}>Limite de gastos para {formatarMes(mes)} (R$)</label>
          <div className="linha">
            <input
              id={`${id}-limite`}
              inputMode="decimal"
              placeholder="0,00"
              autoComplete="off"
              value={entrada}
              onChange={(e) => {
                setEntrada(e.target.value);
                setErro('');
              }}
              autoFocus={editando}
              aria-invalid={erro ? true : undefined}
              aria-describedby={erro ? `${id}-erro` : undefined}
            />
            <button type="submit" className="botao-principal">
              {editando ? 'Salvar' : 'Definir limite'}
            </button>
            {editando && (
              <button type="button" className="botao-secundario" onClick={() => setEditando(false)}>
                Cancelar
              </button>
            )}
          </div>
          {erro && (
            <p id={`${id}-erro`} className="erro" role="alert">
              {erro}
            </p>
          )}
          {!limite && (
            <p className="vazio">
              Defina quanto quer gastar neste mês para acompanhar o progresso. Gasto até agora:{' '}
              <strong className="valor">{formatarMoeda(gasto)}</strong>
            </p>
          )}
        </form>
      ) : (
        <Progresso gasto={gasto} limite={limite} onAlterar={comecarEdicao} onRemover={() => onRemover(mes)} />
      )}
    </section>
  );
}

function Progresso({ gasto, limite, onAlterar, onRemover }) {
  const fracao = gasto / limite;
  const estourou = gasto > limite;
  const diferenca = Math.abs(limite - gasto);

  return (
    <div className={`progresso ${estourou ? 'estourado' : ''}`}>
      <div className="progresso-numeros">
        <span>
          <strong>{formatarMoeda(gasto)}</strong> de {formatarMoeda(limite)}
        </span>
        <span className="progresso-pct">{formatarPorcentagem(fracao)} usado</span>
      </div>

      <div
        className="progresso-trilho"
        role="progressbar"
        aria-label="Orçamento usado"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fracao * 100)}
      >
        <div className="progresso-barra" style={{ width: `${Math.min(fracao, 1) * 100}%` }} />
      </div>

      <div className="progresso-rodape">
        <span className="progresso-status">
          {estourou ? (
            <>
              <span aria-hidden="true">⚠</span> Orçamento estourado em {formatarMoeda(diferenca)}
            </>
          ) : (
            <>Restam {formatarMoeda(diferenca)}</>
          )}
        </span>
        <span className="progresso-acoes">
          <button type="button" className="link" onClick={onAlterar}>
            Alterar limite
          </button>
          <button
            type="button"
            className="link perigo"
            onClick={() => window.confirm('Remover o limite deste mês?') && onRemover()}
          >
            Remover
          </button>
        </span>
      </div>
    </div>
  );
}
