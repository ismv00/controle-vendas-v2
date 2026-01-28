'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerWithEmail } from '@/src/services/authService';

import { BarChart3, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    try {
      setLoading(true);
      await registerWithEmail(email, password);
      router.push('/');
    } catch {
      setError('Erro ao criar a conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <BarChart3 className="text-white w-6 h-6" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">VendaFácil</h1>
          <p className="text-sm text-gray-500">Controle de Vendas</p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Criar conta</h2>
            <p className="text-sm text-gray-500 mt-1">
              Preencha os dados para começar a usar o sistema.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SENHA */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 border rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* CONFIRMAR SENHA */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 border rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium
                hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          {/* VOLTAR PARA LOGIN */}
          <p className="text-center text-sm text-gray-500">
            Já tem uma conta?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 font-medium hover:underline"
            >
              Entrar
            </button>
          </p>
        </div>

        {/* FOOTER */}
        <p className="text-xs text-gray-400 text-center">
          Ao continuar, você concorda com nossos{' '}
          <span className="underline cursor-pointer">Termos de Uso</span> e{' '}
          <span className="underline cursor-pointer">Política de Privacidade</span>
        </p>
      </div>
    </div>
  );
}
