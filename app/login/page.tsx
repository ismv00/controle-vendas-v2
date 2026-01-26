'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithEmail } from '@/src/services/authService';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginWithEmail(email, password);
      router.push('/');
    } catch (err) {
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LADO ESQUERDO – BRAND */}
      <div className="hidden md:flex flex-col items-center justify-center bg-blue-600 text-white px-10">
        <h1 className="text-4xl font-bold mb-4">Venda Fácil</h1>
        <p className="text-lg text-blue-100 max-w-sm text-center">
          Controle suas vendas, clientes e lucros de forma simples e organizada.
        </p>
      </div>

      {/* LADO DIREITO – FORM */}
      <div className="flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Entrar</h2>
            <p className="text-sm text-gray-500 mt-1">Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />

            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* AÇÕES */}
          <div className="text-center text-sm text-gray-500 space-y-2">
            <button
              onClick={() => router.push('/forgot-password')}
              className="hover:underline"
              type="button"
            >
              Esqueci minha senha
            </button>
            <p>
              Não tem conta?{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-blue-600 font-medium cursor-pointer hover:underline"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
