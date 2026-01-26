'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerWithEmail } from '@/src/services/authService';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password != confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    try {
      setLoading(true);
      await registerWithEmail(email, password);
      router.push('/');
    } catch (err) {
      setError('Erro ao criar a conta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LADO ESQUERDO */}
      <div className="hidden md:flex flex-col items-center justify-center bg-blue-600 text-white px-10">
        <h1 className="text-4xl font-bold mb-4">Venda Fácil</h1>
        <p className="text-lg opacity-90 text-center max-w-md">
          Crie sua conta e comece a organizar suas vendas, clientes e produtos de forma simples e
          eficiente.
        </p>
      </div>

      {/* LADO DIREITO */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6">
          <h2 className="text-2xl font-semibold text-center">Criar conta</h2>

          <form onSubmit={handleRegister} className="space-y-4">
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

            <input
              type="password"
              placeholder="Confirmar senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              required
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600">
            Já tem conta?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-primary font-medium hover:underline"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
