import React, { useState } from 'react';
import '../index.css';

// =====================================================
// TATAMEX PERFORMANCE - Autenticação
// Sistema de Login/Registro com Supabase
// =====================================================

interface AuthProps {
  onLogin: (user: any) => void;
  supabase: any;
}

const Auth: React.FC<AuthProps> = ({ onLogin, supabase }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // Login
        const { data, error: authError } = await supabase.login(email, password);
        
        if (authError) {
          setError(authError.message);
        } else if (data?.user) {
          // Buscar dados do usuário no banco
          try {
            const response = await fetch(
              `${supabase.url}/rest/v1/usuarios?auth_id=eq.${data.user.id}&select=*`,
              {
                headers: supabase.getHeaders()
              }
            );
            const userData = await response.json();
            
            onLogin({ 
              ...data.user, 
              nome: userData?.[0]?.nome || email,
              tipo: userData?.[0]?.tipo || 'aluno'
            });
          } catch {
            onLogin({ ...data.user, nome: email, tipo: 'aluno' });
          }
        }
      } else {
        // Registro
        const { data, error: authError } = await supabase.register(email, password, nome);
        
        if (authError) {
          setError(authError.message);
        } else if (data?.user) {
          // Criar perfil de usuário
          try {
            await fetch(
              `${supabase.url}/rest/v1/usuarios`,
              {
                method: 'POST',
                headers: supabase.getHeaders(),
                body: JSON.stringify({
                  auth_id: data.user.id,
                  nome: nome,
                  email: email,
                  tipo: 'aluno',
                  telefone: ''
                })
              }
            );
          } catch (e) {
            console.error('Erro ao criar perfil:', e);
          }
          
          setSuccess('Conta criada com sucesso! Faça login para continuar.');
          setIsLogin(true);
          setEmail('');
          setPassword('');
          setNome('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-slate-900 to-slate-900"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl mb-4 shadow-lg shadow-red-600/30">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-orbitron font-bold text-white mb-2">
            TATAMEX
          </h1>
          <p className="text-slate-400 text-sm uppercase tracking-widest">
            Performance System
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl shadow-black/30">
          <h2 className="text-2xl font-orbitron font-bold text-white text-center mb-6">
            {isLogin ? 'ENTRAR' : 'CADASTRAR'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  required={!isLogin}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4">
                <p className="text-green-400 text-sm text-center">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : (
                isLogin ? 'ENTRAR' : 'CADASTRAR'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-slate-400 hover:text-red-400 text-sm transition-colors duration-300"
            >
              {isLogin ? (
                <>Não tem conta? <span className="font-bold text-red-400">Cadastre-se</span></>
              ) : (
                <>Já tem conta? <span className="font-bold text-red-400">Entre</span></>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          © 2026 TatameX Performance. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Auth;
