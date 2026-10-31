import { formatarMoeda, formatarPorcentagem } from '../utils/format';

// Barras horizontais ordenadas (maior primeiro), em uma única cor:
// barras sobre a mesma base são mais fáceis de comparar do que fatias de pizza.
export default function CategoryChart({ dados }) {
  const maior = dados[0]?.valor || 0;

  return (
    <section className="painel">
      <h2>Para onde vai o seu dinheiro</h2>
      {dados.length === 0 ? (
        <p className="vazio">Adicione despesas para ver os gastos por categoria.</p>
      ) : (
        <ul className="barras" aria-label="Gastos por categoria">
          {dados.map((d) => (
            <li key={d.categoria} className="barra-linha">
              <span className="barra-nome">{d.categoria}</span>
              <span className="barra-trilho">
                <span className="barra" style={{ width: `${(d.valor / maior) * 100}%` }} />
              </span>
              <span className="barra-valor">
                {formatarMoeda(d.valor)}
                <span className="barra-pct">{formatarPorcentagem(d.fracao)}</span>
              </span>
              <span className="dica" role="tooltip">
                <strong>{d.categoria}</strong>
                {formatarMoeda(d.valor)} · {formatarPorcentagem(d.fracao)} das despesas
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
