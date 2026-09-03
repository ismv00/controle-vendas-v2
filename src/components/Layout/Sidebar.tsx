'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutGrid, Users, Package, Tags, ShoppingBag } from 'lucide-react';

import { useAuth } from '@/src/contexts/AuthContext';
import { logout } from '@/src/services/authService';
import { getClientsByUser } from '@/src/services/clientService';
import { getProductsByUser } from '@/src/services/productService';
import { getProductPricesByUser } from '@/src/services/priceService';
import { getSalesByUser } from '@/src/services/saleService';
import { isInPeriod } from '@/src/lib/period';
import { Avatar } from '@/src/components/ui/Avatar';

// Não há ainda uma feature de metas — valor fixo até existir configuração real.
const MONTHLY_GOAL = 18000;

type CountKey = 'clients' | 'products' | 'prices' | 'sales' | null;

const NAV_ITEMS: { label: string; href: string; icon: typeof LayoutGrid; countKey: CountKey }[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid, countKey: null },
  { label: 'Clientes', href: '/clients', icon: Users, countKey: 'clients' },
  { label: 'Produtos', href: '/produtos', icon: Package, countKey: 'products' },
  { label: 'Tabela de Preços', href: '/price-table', icon: Tags, countKey: 'prices' },
  { label: 'Vendas', href: '/vendas', icon: ShoppingBag, countKey: 'sales' },
];

export function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [counts, setCounts] = useState({ clients: 0, products: 0, prices: 0, sales: 0 });
  const [monthRevenue, setMonthRevenue] = useState(0);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      const [clients, products, prices, sales] = await Promise.all([
        getClientsByUser(user!.uid),
        getProductsByUser(user!.uid),
        getProductPricesByUser(user!.uid),
        getSalesByUser(user!.uid),
      ]);

      if (cancelled) return;

      setCounts({
        clients: clients.length,
        products: products.length,
        prices: prices.length,
        sales: sales.length,
      });

      const revenue = sales
        .filter((sale) => isInPeriod(sale.createdAt, 'month'))
        .reduce((sum, sale) => sum + sale.totalValue, 0);

      setMonthRevenue(revenue);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  const goalPercent = Math.min(100, Math.round((monthRevenue / MONTHLY_GOAL) * 100));
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const subLabel = user?.email ?? '';

  return (
    <aside className="flex h-screen w-[252px] shrink-0 flex-col gap-[26px] border-r border-white/10 bg-dark px-4 py-[22px]">
      {/* Marca */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-logo bg-accent text-[15px] font-bold text-white">
          VF
        </div>
        <div className="leading-tight">
          <p className="text-[14.5px] font-bold text-white">Venda Fácil</p>
          <p className="text-[11px] text-white/50">Controle de vendas</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        <p className="px-[10px] pb-2 text-[10px] font-semibold uppercase tracking-[.09em] text-white/40">
          Operação
        </p>

        {NAV_ITEMS.map(({ label, href, icon: Icon, countKey }) => {
          const isActive = pathname === href || (href === '/dashboard' && pathname === '/');
          const count = countKey ? counts[countKey] : null;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-[10px] rounded-iconbtn px-[10px] py-[9px] text-[13.5px] font-medium transition ${
                isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span
                className={`h-[7px] w-[7px] shrink-0 rounded-full ${isActive ? 'bg-accent' : 'bg-white/25'}`}
              />
              <Icon size={15} className="shrink-0 opacity-80" />
              <span className="flex-1 truncate">{label}</span>
              {count !== null && (
                <span className="font-mono text-[10.5px] text-white/60">{count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      <div className="mt-auto flex flex-col gap-4">
        <div className="rounded-block border border-white/10 bg-white/[.04] p-3">
          <p className="text-[10.5px] font-semibold uppercase tracking-[.06em] text-white/50">
            Meta do mês
          </p>
          <p className="mt-1 font-mono text-[13px] font-semibold text-white">
            {goalPercent}%{' '}
            <span className="font-sans text-[11px] font-normal text-white/50">
              de R$ {MONTHLY_GOAL.toLocaleString('pt-BR')}
            </span>
          </p>
          <div className="mt-2 h-[5px] w-full overflow-hidden rounded-pill bg-white/10">
            <div
              className="h-full rounded-pill bg-positive-soft"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 px-1">
          <Avatar name={displayName} size={30} tone="dark" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[12.5px] font-semibold text-white">{displayName}</p>
            <p className="truncate text-[11px] text-white/45">{subLabel}</p>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 text-[11.5px] font-medium text-white/60 transition hover:text-white"
          >
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
