import { useId, useState } from 'react';

const TITULOS = {
  entrar: 'Entrar',
  cadastrar: 'Criar conta',
  recuperar: 'Recuperar senha',
};

const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Login({ entrar, cadastrar, entrarComGoogle, recuperarSenha }) {
  const id = useId();
  const [modo, setModo] = useState('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const trocarModo = (novo) => {
    setModo(novo);
    setErro('');
    setAviso('');
  };

  const enviar = async (e) => {
    e.preventDefault();
    setAviso('');
    const emailLimpo = email.trim();
    if (!emailValido(emailLimpo)) return setErro('Informe um e-mail válido.');
    if (modo !== 'recuperar' && senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.');

    setEnviando(true);
    setErro('');
    const acao = { entrar, cadastrar, recuperar: recuperarSenha }[modo];
    const { erro: falha } = await acao(emailLimpo, senha);
    setEnviando(false);
    if (falha) return setErro(falha);

    if (modo === 'cadastrar') {
      setAviso(`Conta criada. Enviamos um link de confirmação para ${emailLimpo}. Confirme e depois entre aqui.`);
      setModo('entrar');
      setSenha('');
    } else if (modo === 'recuperar') {
      setAviso(`Se houver uma conta com ${emailLimpo}, você vai receber um link para criar uma nova senha.`);
    }
  };

  const comGoogle = async () => {
    setErro('');
    const { erro: falha } = await entrarComGoogle();
    if (falha) setErro(falha);
  };

  return (
    <main className="app app-login">
      <header>
        <h1>Controle de Orçamento</h1>
        <p className="subtitulo">Entre para acessar suas finanças em qualquer dispositivo.</p>
      </header>

      <section className="painel login">
        {modo !== 'recuperar' && (
          <div className="segmentado" role="group" aria-label="Entrar ou criar conta">
            {['entrar', 'cadastrar'].map((m) => (
              <button key={m} type="button" className={modo === m ? 'ativo' : ''} aria-pressed={modo === m} onClick={() => trocarModo(m)}>
                {TITULOS[m]}
              </button>
            ))}
          </div>
        )}

        {modo === 'recuperar' && <h2>{TITULOS.recuperar}</h2>}

        <form className="form" onSubmit={enviar} noValidate>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              aria-describedby={erro ? `${id}-erro` : undefined}
            />
          </label>

          {modo !== 'recuperar' && (
            <label>
              Senha
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete={modo === 'cadastrar' ? 'new-password' : 'current-password'}
                placeholder={modo === 'cadastrar' ? 'Pelo menos 6 caracteres' : ''}
              />
            </label>
          )}

          {erro && (
            <span id={`${id}-erro`} className="erro" role="alert">
              {erro}
            </span>
          )}
          {aviso && (
            <p className="sucesso" role="status">
              {aviso}
            </p>
          )}

          <button type="submit" className="botao-principal" disabled={enviando}>
            {enviando ? 'Aguarde…' : modo === 'recuperar' ? 'Enviar link' : TITULOS[modo]}
          </button>
        </form>

        {modo === 'entrar' && (
          <button type="button" className="link" onClick={() => trocarModo('recuperar')}>
            Esqueci minha senha
          </button>
        )}
        {modo === 'recuperar' && (
          <button type="button" className="link" onClick={() => trocarModo('entrar')}>
            Voltar para o login
          </button>
        )}

        {modo !== 'recuperar' && (
          <>
            <div className="separador" aria-hidden="true">
              <span>ou</span>
            </div>
            <button type="button" className="botao-secundario botao-google" onClick={comGoogle}>
              <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
              </svg>
              Continuar com Google
            </button>
          </>
        )}
      </section>
    </main>
  );
}

// Tela mostrada quando o usuário volta pelo link de recuperação de senha
export function NovaSenha({ definirNovaSenha }) {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.');
    setEnviando(true);
    const { erro: falha } = await definirNovaSenha(senha);
    setEnviando(false);
    if (falha) setErro(falha);
  };

  return (
    <main className="app app-login">
      <header>
        <h1>Controle de Orçamento</h1>
      </header>
      <section className="painel login">
        <h2>Criar nova senha</h2>
        <form className="form" onSubmit={enviar} noValidate>
          <label>
            Nova senha
            <input
              type="password"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                setErro('');
              }}
              autoComplete="new-password"
              placeholder="Pelo menos 6 caracteres"
              autoFocus
            />
          </label>
          {erro && (
            <span className="erro" role="alert">
              {erro}
            </span>
          )}
          <button type="submit" className="botao-principal" disabled={enviando}>
            {enviando ? 'Salvando…' : 'Salvar nova senha'}
          </button>
        </form>
      </section>
    </main>
  );
}
