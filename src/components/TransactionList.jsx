import { useState } from 'react';
import { formatarData, formatarMoeda } from '../utils/format';

const FILTROS = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'renda', rotulo: 'Rendas' },
  { id: 'despesa', rotulo: 'Despesas' },
];

export default function TransactionList({ transacoes, onRemover }) {
  const [filtro, setFiltro] = useState('todas');

  const visiveis = transacoes
    .filter((t) => filtro === 'todas' || t.tipo === filtro)
    .sort((a, b) => b.data.localeCompare(a.data));

  const remover = (t) => {
    if (window.confirm(`Excluir "${t.descricao}"?`)) onRemover(t.id);
  };

  return (
    <section className="painel">
      <div className="lista-cabecalho">
        <h2>Transações</h2>
        <div className="segmentado" role="group" aria-label="Filtrar">
          {FILTROS.map((f) => (
            <button key={f.id} type="button" className={filtro === f.id ? 'ativo' : ''} onClick={() => setFiltro(f.id)}>
              {f.rotulo}
            </button>
          ))}
        </div>
      </div>

      {visiveis.length === 0 ? (
        <p className="vazio">Nenhuma transação ainda.</p>
      ) : (
        <ul className="lista">
          {visiveis.map((t) => (
            <li key={t.id} className="item">
              <div className="item-info">
                <span className="item-descricao">{t.descricao}</span>
                <span className="item-meta">
                  {t.tipo === 'renda' ? 'Renda' : 'Despesa'} · {t.categoria} · {formatarData(t.data)}
                </span>
              </div>
              <span className={`item-valor ${t.tipo}`}>
                {t.tipo === 'renda' ? '+' : '−'} {formatarMoeda(t.valor)}
              </span>
              <button type="button" className="excluir" onClick={() => remover(t)} aria-label={`Excluir ${t.descricao}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
