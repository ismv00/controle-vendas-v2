'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutGrid, Users, Package, Tags, ShoppingBag, ClipboardList, X } from 'lucide-react';

import { useAuth } from '@/src/contexts/AuthContext';
import { logout } from '@/src/services/authService';
import { getClientsByUser } from '@/src/services/clientService';
import { getProductsByUser } from '@/src/services/productService';
import { getProductPricesByUser } from '@/src/services/priceService';
import { getSalesByUser } from '@/src/services/saleService';
import { getBudgetsByUser } from '@/src/services/budgetService';
import { isInPeriod } from '@/src/lib/period';
import { Avatar } from '@/src/components/ui/Avatar';

// Recolhida (rail) em telas grandes; expande ao passar o mouse, como no Instagram web.
const FADE = 'lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap';

type CountKey = 'clients' | 'products' | 'prices' | 'sales' | 'budgets' | null;

const NAV_ITEMS: { label: string; href: string; icon: typeof LayoutGrid; countKey: CountKey }[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid, countKey: null },
  { label: 'Clientes', href: '/clients', icon: Users, countKey: 'clients' },
  { label: 'Produtos', href: '/produtos', icon: Package, countKey: 'products' },
  { label: 'Tabela de Preços', href: '/price-table', icon: Tags, countKey: 'prices' },
  { label: 'Vendas', href: '/vendas', icon: ShoppingBag, countKey: 'sales' },
  { label: 'Orçamentos', href: '/orcamentos', icon: ClipboardList, countKey: 'budgets' },
];

type Props = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ mobileOpen, onClose }: Props) {
  const { user, companyName, logoUrl, monthlyGoal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [counts, setCounts] = useState({ clients: 0, products: 0, prices: 0, sales: 0, budgets: 0 });
  const [monthRevenue, setMonthRevenue] = useState(0);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      const [clients, products, prices, sales, budgets] = await Promise.all([
        getClientsByUser(user!.uid),
        getProductsByUser(user!.uid),
        getProductPricesByUser(user!.uid),
        getSalesByUser(user!.uid),
        getBudgetsByUser(user!.uid),
      ]);

      if (cancelled) return;

      setCounts({
        clients: clients.length,
        products: products.length,
        prices: prices.length,
        sales: sales.length,
        budgets: budgets.length,
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

  const goalPercent =
    monthlyGoal > 0 ? Math.min(100, Math.round((monthRevenue / monthlyGoal) * 100)) : 0;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const subLabel = companyName || user?.email || '';

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      {/* Reserva o espaço da versão recolhida no layout, em telas grandes */}
      <div className="hidden shrink-0 lg:block lg:w-[76px]" />

      <aside
        className={`group fixed inset-y-0 left-0 z-50 flex h-screen w-[252px] flex-col gap-[26px] overflow-hidden border-r border-white/10 bg-dark px-4 py-[22px] transition-[width,transform] duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:w-[76px] lg:translate-x-0 lg:hover:w-[252px] lg:hover:shadow-2xl`}
      >
      {/* Marca */}
      <div className="flex items-center gap-3 px-1">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="Logo da empresa"
            className="h-[34px] w-[34px] shrink-0 rounded-full border border-white/10 bg-white object-contain p-0.5"
          />
        ) : (
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-logo bg-accent text-[15px] font-bold text-white">
            VF
          </div>
        )}
        <div className={`leading-tight ${FADE}`}>
          <p className="text-[14.5px] font-bold text-white">Venda Fácil</p>
          <p className="text-[11px] text-white/50">Controle de vendas</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-iconbtn text-white/60 transition hover:text-white lg:hidden"
        >
          <X size={16} />
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden">
        <p className={`px-[10px] pb-2 text-[10px] font-semibold uppercase tracking-[.09em] text-white/40 ${FADE}`}>
          Operação
        </p>

        {NAV_ITEMS.map(({ label, href, icon: Icon, countKey }) => {
          const isActive = pathname === href || (href === '/dashboard' && pathname === '/');
          const count = countKey ? counts[countKey] : null;

          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex items-center gap-[10px] rounded-iconbtn px-[10px] py-[9px] text-[13.5px] font-medium transition ${
                isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span
                className={`h-[7px] w-[7px] shrink-0 rounded-full ${isActive ? 'bg-accent' : 'bg-white/25'} ${FADE}`}
              />
              <Icon size={15} className="shrink-0 opacity-80" />
              <span className={`flex-1 truncate ${FADE}`}>{label}</span>
              {count !== null && (
                <span className={`font-mono text-[10.5px] text-white/60 ${FADE}`}>{count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      <div className="mt-auto flex flex-col gap-4">
        <Link
          href="/perfil"
          className={`block rounded-block border border-white/10 bg-white/[.04] p-3 transition hover:bg-white/[.07] ${FADE}`}
        >
          <p className="text-[10.5px] font-semibold uppercase tracking-[.06em] text-white/50">
            Meta do mês
          </p>

          {monthlyGoal > 0 ? (
            <>
              <p className="mt-1 font-mono text-[13px] font-semibold text-white">
                {goalPercent}%{' '}
                <span className="font-sans text-[11px] font-normal text-white/50">
                  de R$ {monthlyGoal.toLocaleString('pt-BR')}
                </span>
              </p>
              <div className="mt-2 h-[5px] w-full overflow-hidden rounded-pill bg-white/10">
                <div
                  className="h-full rounded-pill bg-positive-soft"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
            </>
          ) : (
            <p className="mt-1 text-[11.5px] font-medium text-accent">Configurar meta →</p>
          )}
        </Link>

        <div className="flex items-center gap-2 px-1">
          <Link
            href="/perfil"
            title="Ver perfil"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-iconbtn py-0.5 text-left transition hover:opacity-80"
          >
            <Avatar name={displayName} src={user?.photoURL} size={30} tone="dark" />
            <div className={`min-w-0 flex-1 leading-tight ${FADE}`}>
              <p className="truncate text-[12.5px] font-semibold text-white">{displayName}</p>
              <p className="truncate text-[11px] text-white/45">{subLabel}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            title="Sair"
            className={`shrink-0 text-[11.5px] font-medium text-white/60 transition hover:text-white ${FADE}`}
          >
            Sair
          </button>
        </div>
      </div>
      </aside>
    </>
  );
}
