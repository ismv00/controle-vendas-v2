'use client';

import { Package, Users, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HeaderActions() {
  const router = useRouter();

  return (
    <div className="flex gap-3">
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
  );
}
