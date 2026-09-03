'use client';

import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/src/contexts/AuthContext';
import { getClientsByUser } from '@/src/services/clientService';
import { getProductsByUser } from '@/src/services/productService';
import { getProductPricesByUser } from '@/src/services/priceService';
import { getSalesByUser } from '@/src/services/saleService';

import { Client } from '@/src/types/Client';
import { Product } from '@/src/types/Product';
import { ProductPrice } from '@/src/types/ProductPrice';
import { Sale } from '@/src/types/Sale';

import { Period, isInPeriod, isInPreviousPeriod, percentDelta } from '@/src/lib/period';
import { formatBRL } from '@/src/lib/format';
import { TrendChart } from './TrendChart';
import { TopProducts } from './TopProducts';
import { RecentSales } from './RecentSales';
import { KpiCard } from './KpiCard';

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: 'month', label: 'Este mês' },
  { key: 'year', label: 'Ano' },
];

function formatMoneyParts(value: number) {
  const negative = value < 0;
  const abs = Math.abs(value);
  const [reais, cents] = abs.toFixed(2).split('.');
  return { sign: negative ? '-' : '', reais: Number(reais).toLocaleString('pt-BR'), cents };
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

const PREVIOUS_LABEL: Record<Period, string> = {
  today: 'vs. ontem',
  month: 'vs. mês anterior',
  year: 'vs. ano anterior',
};

const EYEBROW_LABEL: Record<Period, string> = {
  today: 'FATURAMENTO DE HOJE',
  month: 'FATURAMENTO DO MÊS',
  year: 'FATURAMENTO DO ANO',
};

export function Dashboard() {
  const { user } = useAuth();

  const [period, setPeriod] = useState<Period>('month');
  const [loading, setLoading] = useState(true);

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      setLoading(true);

      const [clientsData, productsData, pricesData, salesData] = await Promise.all([
        getClientsByUser(user!.uid),
        getProductsByUser(user!.uid),
        getProductPricesByUser(user!.uid),
        getSalesByUser(user!.uid),
      ]);

      if (cancelled) return;

      setClients(clientsData);
      setProducts(productsData);
      setPrices(pricesData);
      setSales(salesData);
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const stats = useMemo(() => {
    const current = sales.filter((s) => isInPeriod(s.createdAt, period));
    const previous = sales.filter((s) => isInPreviousPeriod(s.createdAt, period));

    const revenue = current.reduce((sum, s) => sum + s.totalValue, 0);
    const previousRevenue = previous.reduce((sum, s) => sum + s.totalValue, 0);

    const profit = current.reduce((sum, s) => sum + s.totalProfit, 0);
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    const revenueDelta = percentDelta(revenue, previousRevenue);

    const salesCount = current.length;
    const previousSalesCount = previous.length;
    const salesCountDelta = salesCount - previousSalesCount;

    const avgTicket = salesCount > 0 ? revenue / salesCount : 0;
    const previousAvgTicket = previousSalesCount > 0 ? previousRevenue / previousSalesCount : 0;
    const avgTicketDelta = avgTicket - previousAvgTicket;

    const productsWithoutPrice = products.filter(
      (p) => !prices.some((price) => price.productId === p.id)
    ).length;

    const newClients = clients.filter((c) => isInPeriod(c.createdAt, period)).length;

    const now = new Date();
    const last7Days = sales.filter((s) => {
      const diff = (now.getTime() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    }).length;

    const trendBuckets = Array.from({ length: 14 }).map((_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (13 - i));
      date.setHours(0, 0, 0, 0);

      const value = sales
        .filter((s) => {
          const d = s.createdAt;
          return (
            d.getDate() === date.getDate() &&
            d.getMonth() === date.getMonth() &&
            d.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, s) => sum + s.totalValue, 0);

      return { date, value };
    });

    const productQuantities = new Map<string, number>();
    current.forEach((sale) => {
      sale.items.forEach((item) => {
        productQuantities.set(
          item.productName,
          (productQuantities.get(item.productName) ?? 0) + item.quantity
        );
      });
    });

    const topProducts = Array.from(productQuantities.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);

    const recentSales = current.slice(0, 5);

    return {
      revenue,
      profit,
      margin,
      revenueDelta,
      salesCount,
      salesCountDelta,
      avgTicket,
      avgTicketDelta,
      productsWithoutPrice,
      newClients,
      last7Days,
      trendBuckets,
      topProducts,
      recentSales,
    };
  }, [sales, clients, products, prices, period]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const firstName = displayName.split(/[\s.]/)[0];
  const monthLabel = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const heroMoney = formatMoneyParts(stats.revenue);

  return (
    <div className="animate-vf-in space-y-5">
      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-bold tracking-[-.025em] text-ink">
            {greeting()}, {firstName.charAt(0).toUpperCase() + firstName.slice(1)}
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-3">
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)} · {stats.last7Days} vendas nos
            últimos 7 dias
          </p>
        </div>

        <div className="flex items-center gap-[3px] rounded-input border border-[#e4e1da] bg-[#eeece7] p-[3px]">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key)}
              className={`rounded-[7px] px-3 py-1.5 text-[12.5px] font-semibold transition ${
                period === opt.key ? 'bg-white text-ink shadow-pill-active' : 'text-ink-3 hover:text-ink'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-[13px] text-mute">Carregando painel...</p>
      ) : (
        <>
          {/* Grid superior */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            {/* Hero escuro */}
            <div className="relative rounded-hero bg-dark p-[22px]">
              {stats.revenueDelta !== null && (
                <span className="absolute right-[22px] top-[22px] rounded-pill bg-[rgba(126,226,176,.16)] px-2.5 py-1 text-[11px] font-semibold text-positive-soft">
                  {stats.revenueDelta >= 0 ? '+' : ''}
                  {stats.revenueDelta.toFixed(1)}%
                </span>
              )}

              <p className="text-[11.5px] font-semibold uppercase tracking-[.06em] text-white/50">
                {EYEBROW_LABEL[period]}
              </p>

              <p className="mt-2 font-mono text-[40px] font-semibold leading-none tracking-[-.03em] text-white">
                {heroMoney.sign}R$ {heroMoney.reais}
                <span className="text-[22px] opacity-55">,{heroMoney.cents}</span>
              </p>

              <p className="mt-3 text-[13px] text-white/70">
                Lucro{' '}
                <span className="font-mono font-semibold text-positive-soft">
                  {formatBRL(stats.profit)}
                </span>
                <span className="mx-2 text-white/25">·</span>
                Margem <span className="font-mono font-semibold text-white">{stats.margin.toFixed(1)}%</span>
              </p>

              <div className="mt-5">
                <TrendChart buckets={stats.trendBuckets} />
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4">
              <KpiCard
                label={`Vendas ${period === 'month' ? 'no mês' : period === 'today' ? 'hoje' : 'no ano'}`}
                value={String(stats.salesCount)}
                delta={`${stats.salesCountDelta >= 0 ? '+' : ''}${stats.salesCountDelta} ${PREVIOUS_LABEL[period]}`}
                tone={stats.salesCountDelta >= 0 ? 'positive' : 'warn'}
              />
              <KpiCard
                label="Ticket médio"
                value={formatBRL(stats.avgTicket)}
                delta={`${stats.avgTicketDelta >= 0 ? '+' : ''}${formatBRL(stats.avgTicketDelta)}`}
                tone={stats.avgTicketDelta >= 0 ? 'positive' : 'warn'}
              />
              <KpiCard
                label="Produtos"
                value={String(products.length)}
                delta={
                  stats.productsWithoutPrice > 0 ? `${stats.productsWithoutPrice} sem preço` : undefined
                }
                tone="warn"
              />
              <KpiCard
                label="Clientes"
                value={String(clients.length)}
                delta={stats.newClients > 0 ? `+${stats.newClients} novos` : undefined}
                tone="positive"
              />
            </div>
          </div>

          {/* Grid inferior */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <RecentSales sales={stats.recentSales} />

            <div className="rounded-card border border-border-divider-2 bg-surface p-5">
              <h2 className="mb-4 text-[14px] font-semibold text-ink">Produtos mais vendidos</h2>
              <TopProducts rows={stats.topProducts} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
