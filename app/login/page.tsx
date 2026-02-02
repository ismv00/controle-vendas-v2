'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail } from "@/src/services/authService";

import { BarChart3, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("");

    try {
      await loginWithEmail(email, password);
      router.push("/");
    } catch {
      setError("Email ou senha inválidos.");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <BarChart3 className="text-white w-6 h-6" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">VendaFácil</h1>
          <p className="text-sm text-gray-500">Controle de Vendas</p>
        </div>


        {/**CARD */}
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6
        ">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Entrar</h2>
            <p className="text-sm text-gray-500 mt-1">Entre com suas credenciais para acessar o sistema.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (<EyeOff className="w-4 h-4" />) : (<Eye className="w-4 h-4" />)}
              </button>
            </div>

            {/**ESQUECI A SENHA */}
            <div className="text-right">
              <button type="button" onClick={() => router.push("/forgot-password")} className="text-xs text-blue-600 hover:underline">Esqueceu a senha?</button>
            </div>

            {error && (
              <p className="text-sm text-red-500text-center">{error}</p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60"

            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

          </form>

          {/**CRIAR CONTA */}
          <p className="text-center text-sm text-gray-500">Não tem uma conta? {' '}

            <button onClick={() => router.push('/register')} className="text-blue-600 font-medium hover:underline">Criar conta</button>
          </p>
        </div>

        <p className="text-xs text-gray-400 text-center">Ao continuar, você concorda com nossos{' '}
          <span className="underline cursor-pointer">Termos de Uso</span>{' '}
          e{' '}
          <span className="underline cursor-pointer">Política de Privacidade</span>
        </p>
      </div>
    </div>
  )
}
