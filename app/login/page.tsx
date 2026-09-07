'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithEmail, loginWithGoogle } from '@/src/services/authService';

import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/src/components/Layout/AuthLayout';
import { GoogleIcon } from '@/src/components/ui/GoogleIcon';
import { getFirebaseErrorCode } from '@/src/lib/firebaseError';

const inputClass =
  'w-full rounded-input border border-border-input bg-surface-subtle-2 py-2.5 pl-10 pr-4 text-[13px] text-ink placeholder:text-placeholder focus:outline-none focus:border-accent';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginWithEmail(email, password);
      router.push('/');
    } catch {
      setError('Email ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError('');

    try {
      await loginWithGoogle();
      router.push('/');
    } catch (err) {
      const code = getFirebaseErrorCode(err);

      if (code === 'auth/account-exists-with-different-credential') {
        setError(
          'Já existe uma conta com este e-mail e senha. Entre com a senha e vincule o Google no menu lateral.'
        );
      } else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError('Não foi possível entrar com o Google. Tente novamente.');
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-logo bg-accent text-[14px] font-bold text-white">
          VF
        </div>
        <div className="leading-tight">
          <p className="text-[14px] font-bold text-ink">Venda Fácil</p>
          <p className="text-[11px] text-ink-3">Controle de vendas</p>
        </div>
      </div>

      <h1 className="text-[22px] font-bold tracking-[-.02em] text-ink">Entrar</h1>
      <p className="mt-1 text-[13px] text-ink-3">Entre com suas credenciais para acessar o sistema.</p>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-input border border-border-input bg-white py-2.5 text-[13px] font-semibold text-ink transition hover:border-ink-4 disabled:opacity-60"
      >
        <GoogleIcon />
        {googleLoading ? 'Conectando...' : 'Continuar com Google'}
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border-main" />
        <span className="text-[11.5px] text-ink-4">ou</span>
        <div className="h-px flex-1 bg-border-main" />
      </div>

      <form onSubmit={handleLogin} className="space-y-3.5">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4" />
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`${inputClass} pr-10`}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => router.push('/forgot-password')}
            className="text-[12px] font-medium text-accent hover:underline"
          >
            Esqueceu a senha?
          </button>
        </div>

        {error && <p className="text-[12.5px] text-negative">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-input bg-accent py-2.5 text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-[12.5px] text-ink-3">
        Não tem uma conta?{' '}
        <button onClick={() => router.push('/register')} className="font-semibold text-accent hover:underline">
          Criar conta
        </button>
      </p>

      <p className="mt-8 text-center text-[11px] text-mute">
        Ao continuar, você concorda com nossos{' '}
        <span className="cursor-pointer underline">Termos de Uso</span> e{' '}
        <span className="cursor-pointer underline">Política de Privacidade</span>
      </p>
    </AuthLayout>
  );
}
