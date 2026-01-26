'use client';

import { Package, Users, ShoppingCart, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logout } from '@/src/services/authService';

export function HeaderActions() {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <div className="flex items-center w-full">
      <div className="flex gap-3 mx-auto">
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => router.push('/produtos?novo=true')}
        >
          <Package size={16} />
          Novo Produto
        </button>

        <button
          className="btn-secondary flex items-center gap-2"
          onClick={() => router.push('/clients?novo=true')}
        >
          <Users size={16} />
          Novo Cliente
        </button>

        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => router.push('/vendas?novo=true')}
        >
          <ShoppingCart size={16} />
          Nova Venda
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="ml-auto flex items-center gap-2 text-sm text-red-600 hover:underline"
      >
        <LogOut size={16} />
        Sair
      </button>
    </div>
  );
}
