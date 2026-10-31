import SummaryCards from './components/SummaryCards';
import MonthlyBudget from './components/MonthlyBudget';
import TransactionForm from './components/TransactionForm';
import CategoryChart from './components/CategoryChart';
import TransactionList from './components/TransactionList';
import { useTransactions } from './hooks/useTransactions';
import { useBudgets } from './hooks/useBudgets';

export default function App() {
  const { transacoes, adicionar, remover, renda, despesas, saldo, gastosPorCategoria } = useTransactions();
  const { limites, definirLimite, removerLimite } = useBudgets();

  return (
    <main className="app">
      <header>
        <h1>Controle de Orçamento</h1>
        <p className="subtitulo">Seus dados ficam salvos apenas neste navegador.</p>
      </header>
      <SummaryCards renda={renda} despesas={despesas} saldo={saldo} />
      <MonthlyBudget transacoes={transacoes} limites={limites} onDefinir={definirLimite} onRemover={removerLimite} />
      <div className="grade">
        <TransactionForm onAdicionar={adicionar} />
        <CategoryChart dados={gastosPorCategoria} />
      </div>
      <TransactionList transacoes={transacoes} onRemover={remover} />
    </main>
  );
}
