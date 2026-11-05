import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Mensagens do Supabase Auth traduzidas para o usuário
const TRADUCOES = [
  [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
  [/email not confirmed/i, 'Confirme seu e-mail antes de entrar. Procure a mensagem na sua caixa de entrada.'],
  [/user already registered/i, 'Já existe uma conta com este e-mail. Use “Entrar”.'],
  [/password should be at least/i, 'A senha precisa ter pelo menos 6 caracteres.'],
  [/unable to validate email|invalid email/i, 'Informe um e-mail válido.'],
  [/rate limit|too many requests/i, 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.'],
  [/failed to fetch|network/i, 'Sem conexão com o servidor. Verifique sua internet.'],
];

export function traduzirErro(erro) {
  const msg = erro?.message || '';
  const achado = TRADUCOES.find(([padrao]) => padrao.test(msg));
  return achado ? achado[1] : 'Algo deu errado. Tente novamente.';
}

// Resultado das ações: { erro: string | null }
const resultado = ({ error }) => ({ erro: error ? traduzirErro(error) : null });

export function useAuth() {
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  // true quando o usuário volta pelo link de "esqueci minha senha"
  const [definindoSenha, setDefinindoSenha] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregando(false);
    });
    const { data } = supabase.auth.onAuthStateChange((evento, novaSessao) => {
      setSessao(novaSessao);
      if (evento === 'PASSWORD_RECOVERY') setDefinindoSenha(true);
      if (evento === 'SIGNED_OUT') setDefinindoSenha(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const voltarPara = window.location.origin;

  return {
    usuario: sessao?.user ?? null,
    carregando,
    entrar: async (email, senha) => resultado(await supabase.auth.signInWithPassword({ email, password: senha })),
    cadastrar: async (email, senha) => {
      const resposta = await supabase.auth.signUp({ email, password: senha, options: { emailRedirectTo: voltarPara } });
      // Com confirmação por e-mail ativa, um e-mail já cadastrado volta sem erro e sem identidades
      if (!resposta.error && resposta.data.user?.identities?.length === 0) {
        return { erro: 'Já existe uma conta com este e-mail. Use “Entrar”.' };
      }
      return resultado(resposta);
    },
    entrarComGoogle: async () =>
      resultado(await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: voltarPara } })),
    recuperarSenha: async (email) =>
      resultado(await supabase.auth.resetPasswordForEmail(email, { redirectTo: voltarPara })),
    definindoSenha,
    definirNovaSenha: async (senha) => {
      const r = resultado(await supabase.auth.updateUser({ password: senha }));
      if (!r.erro) setDefinindoSenha(false);
      return r;
    },
    sair: () => supabase.auth.signOut(),
  };
}
