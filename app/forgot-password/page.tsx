'use client';

import { useState } from 'react';
import { resetPassword } from '@/src/services/authService';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/src/components/Layout/AuthLayout';

const inputClass =
  'w-full rounded-input border border-border-input bg-surface-subtle-2 px-3 py-2.5 text-[13px] text-ink placeholder:text-placeholder focus:outline-none focus:border-accent';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setSuccess(true);

      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err) {
      console.error(err);
      setError('Não foi possível enviar o e-mail. Tente novamente.');
    } finally {
      setLoading(false);
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

      <h1 className="text-[22px] font-bold tracking-[-.02em] text-ink">Esqueci minha senha</h1>
      <p className="mt-1 text-[13px] text-ink-3">
        Informe seu e-mail e enviaremos um link para redefinir a senha.
      </p>

      {success ? (
        <p className="mt-6 text-[13px] text-positive">
          Se o e-mail existir, enviamos um link para redefinir sua senha. Redirecionando para o
          login...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <input
            type="email"
            className={inputClass}
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="text-[12.5px] text-negative">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-input bg-accent py-2.5 text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-[12.5px] text-ink-3">
        Lembrou a senha?{' '}
        <button onClick={() => router.push('/login')} className="font-semibold text-accent hover:underline">
          Voltar para o login
        </button>
      </p>
    </AuthLayout>
  );
}
