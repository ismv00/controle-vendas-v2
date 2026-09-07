'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export function Topbar() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-end gap-4 border-b border-border-main bg-white/72 px-8 py-4 backdrop-blur-[8px]">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/clients?novo=true')}
          className="rounded-input border border-[#dcd8d0] bg-white px-[14px] py-[9px] text-[13px] font-semibold text-ink transition hover:border-ink-4"
        >
          Novo cliente
        </button>

        <button
          onClick={() => router.push('/produtos?novo=true')}
          className="rounded-input border border-[#dcd8d0] bg-white px-[14px] py-[9px] text-[13px] font-semibold text-ink transition hover:border-ink-4"
        >
          Novo produto
        </button>

        <button
          onClick={() => router.push('/vendas?novo=true')}
          className="flex items-center gap-1.5 rounded-input bg-accent px-4 py-[9px] text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90"
        >
          <Plus size={15} />
          Nova venda
        </button>
      </div>
    </header>
  );
}
