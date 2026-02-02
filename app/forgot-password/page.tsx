'use client';

import { useState } from "react";
import { resetPassword } from "@/src/services/authService";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {

    const router = useRouter();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true);
        setError('');

        try {
            await resetPassword(email)
            setSuccess(true);

            setTimeout(() => {
                router.push('/login')
            }, 2500);
        } catch (err) {
            console.error(err)
            setError('Não foi possível enviar o e-mail. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-6 rounded-xl border w-full max-w-md space-y-4">
                <h1 className="text-xl font-semibold text-gray-900">Esqueci minha senha.</h1>

                {success ? (
                    <p className="text-sm text-green-600">Se o e-mail existir, enviamos um link para redefinir sua senha.</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="email"
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="Seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Enviando...' : 'Enviar Link de recuperação'}</button>
                    </form>
                )}
            </div>
        </div>
    )
}
