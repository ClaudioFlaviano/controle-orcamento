import SummaryCards from './components/SummaryCards';
import MonthlyBudget from './components/MonthlyBudget';
import TransactionForm from './components/TransactionForm';
import CategoryChart from './components/CategoryChart';
import TransactionList from './components/TransactionList';
import Login, { NovaSenha } from './components/Login';
import ImportarDadosLocais from './components/ImportarDadosLocais';
import { useTransactions } from './hooks/useTransactions';
import { useBudgets } from './hooks/useBudgets';
import { useAuth } from './hooks/useAuth';
import { supabaseConfigurado } from './lib/supabase';

export default function App() {
  if (!supabaseConfigurado) return <FaltaConfiguracao />;
  return <ComLogin />;
}

function ComLogin() {
  const auth = useAuth();

  if (auth.carregando) {
    return (
      <main className="app app-login">
        <p className="carregando" role="status">
          Carregando…
        </p>
      </main>
    );
  }
  if (auth.definindoSenha) return <NovaSenha definirNovaSenha={auth.definirNovaSenha} />;
  if (!auth.usuario) return <Login {...auth} />;
  return <Painel usuario={auth.usuario} onSair={auth.sair} />;
}

function Painel({ usuario, onSair }) {
  const dados = useTransactions(usuario.id);
  const orcamento = useBudgets(usuario.id);
  const { transacoes, adicionar, remover, renda, despesas, saldo, gastosPorCategoria } = dados;
  const { limites, definirLimite, removerLimite } = orcamento;
  const erro = dados.erro || orcamento.erro;
  const limparErro = () => {
    dados.limparErro();
    orcamento.limparErro();
  };

  return (
    <main className="app">
      <header className="cabecalho">
        <div>
          <h1>Controle de Orçamento</h1>
          <p className="subtitulo">Seus dados ficam salvos na sua conta e aparecem em qualquer dispositivo.</p>
        </div>
        <div className="conta">
          <span className="conta-email" title={usuario.email}>
            {usuario.email}
          </span>
          <button type="button" className="botao-secundario" onClick={onSair}>
            Sair
          </button>
        </div>
      </header>
      {erro && (
        <div className="alerta" role="alert">
          <span>{erro}</span>
          <button type="button" className="link" onClick={limparErro}>
            Fechar
          </button>
        </div>
      )}
      <ImportarDadosLocais
        userId={usuario.id}
        onImportado={() => {
          dados.recarregar();
          orcamento.recarregar();
        }}
      />
      {dados.carregando || orcamento.carregando ? (
        <p className="carregando" role="status">
          Carregando seus dados…
        </p>
      ) : (
        <>
          <SummaryCards renda={renda} despesas={despesas} saldo={saldo} />
          <MonthlyBudget transacoes={transacoes} limites={limites} onDefinir={definirLimite} onRemover={removerLimite} />
          <div className="grade">
            <TransactionForm onAdicionar={adicionar} />
            <CategoryChart dados={gastosPorCategoria} />
          </div>
          <TransactionList transacoes={transacoes} onRemover={remover} />
        </>
      )}
    </main>
  );
}

function FaltaConfiguracao() {
  return (
    <main className="app app-login">
      <section className="painel login">
        <h2>Configuração pendente</h2>
        <p>
          Faltam as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>. Copie o arquivo{' '}
          <code>.env.example</code> para <code>.env.local</code>, preencha com os dados do seu projeto Supabase e reinicie o{' '}
          <code>npm run dev</code>.
        </p>
      </section>
    </main>
  );
}
