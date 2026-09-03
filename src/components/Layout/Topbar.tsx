'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';

export function Topbar() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border-main bg-white/72 px-8 py-4 backdrop-blur-[8px]">
      <div className="relative w-full max-w-[340px]">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente, produto ou venda"
          className="w-full rounded-input bg-fill-input py-[9px] pl-9 pr-3 text-[13px] text-ink placeholder:text-placeholder focus:outline-none"
        />
      </div>

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
