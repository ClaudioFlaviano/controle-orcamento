import { formatarMoeda } from '../utils/format';

export default function SummaryCards({ renda, despesas, saldo }) {
  const negativo = saldo < 0;
  return (
    <section className="cards" aria-label="Resumo">
      <div className="card">
        <span className="card-titulo">Renda total</span>
        <span className="card-valor">{formatarMoeda(renda)}</span>
      </div>
      <div className="card">
        <span className="card-titulo">Despesas totais</span>
        <span className="card-valor">{formatarMoeda(despesas)}</span>
      </div>
      <div className={`card card-saldo ${negativo ? 'negativo' : 'positivo'}`}>
        <span className="card-titulo">Saldo restante</span>
        <span className="card-valor">{formatarMoeda(saldo)}</span>
        <span className="card-status">
          <span aria-hidden="true">{negativo ? '▼' : '▲'}</span>{' '}
          {negativo ? 'Você gastou mais do que ganhou' : 'Dentro do orçamento'}
        </span>
      </div>
    </section>
  );
}
