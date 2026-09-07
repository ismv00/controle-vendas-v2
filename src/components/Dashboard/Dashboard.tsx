'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

import { useAuth } from '@/src/contexts/AuthContext';
import { getClientsByUser } from '@/src/services/clientService';
import { getProductsByUser } from '@/src/services/productService';
import { getProductPricesByUser } from '@/src/services/priceService';
import { getSalesByUser } from '@/src/services/saleService';

import { Client } from '@/src/types/Client';
import { Product } from '@/src/types/Product';
import { ProductPrice } from '@/src/types/ProductPrice';
import { Sale } from '@/src/types/Sale';

import {
  Period,
  PeriodRange,
  getPeriodRange,
  getPreviousPeriodRange,
  getPrecedingRange,
  isInRange,
  percentDelta,
} from '@/src/lib/period';
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

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function parseInputDate(value: string, endOfDay = false) {
  const [y, m, d] = value.split('-').map(Number);
  return endOfDay ? new Date(y, m - 1, d, 23, 59, 59, 999) : new Date(y, m - 1, d, 0, 0, 0, 0);
}

function formatDayLabel(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]}`;
}

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

function buildTrendBuckets(sales: Sale[], range: PeriodRange) {
  // mantém uma janela mínima de 7 dias pra o gráfico não ficar vazio em períodos muito curtos
  const chartRange: PeriodRange =
    range.end.getTime() - range.start.getTime() >= 6 * DAY_MS
      ? range
      : { start: new Date(range.end.getTime() - 6 * DAY_MS), end: range.end };

  const totalDays = Math.round((chartRange.end.getTime() - chartRange.start.getTime()) / DAY_MS) + 1;

  if (totalDays <= 31) {
    return Array.from({ length: totalDays }).map((_, i) => {
      const date = new Date(chartRange.start);
      date.setDate(date.getDate() + i);

      const value = sales
        .filter(
          (s) =>
            s.createdAt.getDate() === date.getDate() &&
            s.createdAt.getMonth() === date.getMonth() &&
            s.createdAt.getFullYear() === date.getFullYear()
        )
        .reduce((sum, s) => sum + s.totalValue, 0);

      return { label: formatDayLabel(date), value };
    });
  }

  const months: { year: number; month: number }[] = [];
  let cursor = new Date(chartRange.start.getFullYear(), chartRange.start.getMonth(), 1);
  const endCursor = new Date(chartRange.end.getFullYear(), chartRange.end.getMonth(), 1);

  while (cursor <= endCursor) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  return months.map(({ year, month }) => {
    const value = sales
      .filter((s) => s.createdAt.getFullYear() === year && s.createdAt.getMonth() === month)
      .reduce((sum, s) => sum + s.totalValue, 0);

    return { label: `${MONTHS[month]} ${String(year).slice(2)}`, value };
  });
}

export function Dashboard() {
  const { user, companyName } = useAuth();

  const [period, setPeriod] = useState<Period>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
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

  const isCustom = Boolean(customStart && customEnd && customStart <= customEnd);

  function clearCustomRange() {
    setCustomStart('');
    setCustomEnd('');
  }

  const stats = useMemo(() => {
    const range: PeriodRange = isCustom
      ? { start: parseInputDate(customStart), end: parseInputDate(customEnd, true) }
      : getPeriodRange(period);

    const previousRange: PeriodRange = isCustom
      ? getPrecedingRange(range)
      : getPreviousPeriodRange(period);

    const current = sales.filter((s) => isInRange(s.createdAt, range));
    const previous = sales.filter((s) => isInRange(s.createdAt, previousRange));

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

    const newClients = clients.filter((c) => isInRange(c.createdAt, range)).length;

    const now = new Date();
    const last7Days = sales.filter((s) => {
      const diff = (now.getTime() - s.createdAt.getTime()) / DAY_MS;
      return diff >= 0 && diff <= 7;
    }).length;

    const trendBuckets = buildTrendBuckets(sales, range);

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
  }, [sales, clients, products, prices, period, isCustom, customStart, customEnd]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const firstName = displayName.split(/[\s.]/)[0];
  const monthLabel = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const heroMoney = formatMoneyParts(stats.revenue);

  const eyebrowLabel = isCustom ? 'FATURAMENTO NO PERÍODO' : EYEBROW_LABEL[period];
  const previousLabel = isCustom ? 'vs. período anterior' : PREVIOUS_LABEL[period];
  const salesLabel = isCustom
    ? 'Vendas no período'
    : `Vendas ${period === 'month' ? 'no mês' : period === 'today' ? 'hoje' : 'no ano'}`;

  return (
    <div className="animate-vf-in space-y-5">
      {/* Título */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {companyName && (
            <p className="text-[11px] font-semibold uppercase tracking-[.06em] text-ink-4">
              {companyName}
            </p>
          )}
          <h1 className="text-[25px] font-bold tracking-[-.025em] text-ink">
            {greeting()}, {firstName.charAt(0).toUpperCase() + firstName.slice(1)}
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-3">
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)} · {stats.last7Days} vendas nos
            últimos 7 dias
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-[3px] rounded-input border border-[#e4e1da] bg-[#eeece7] p-[3px]">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  setPeriod(opt.key);
                  clearCustomRange();
                }}
                className={`rounded-[7px] px-3 py-1.5 text-[12.5px] font-semibold transition ${
                  !isCustom && period === opt.key
                    ? 'bg-white text-ink shadow-pill-active'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-input border bg-white px-2 py-1.5 ${
              isCustom ? 'border-accent' : 'border-border-input'
            }`}
          >
            <input
              type="date"
              value={customStart}
              max={customEnd || undefined}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-[124px] bg-transparent font-mono text-[12px] text-ink focus:outline-none"
            />
            <span className="text-[12px] text-ink-4">–</span>
            <input
              type="date"
              value={customEnd}
              min={customStart || undefined}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-[124px] bg-transparent font-mono text-[12px] text-ink focus:outline-none"
            />
            {isCustom && (
              <button
                onClick={clearCustomRange}
                title="Limpar período"
                className="shrink-0 text-ink-4 transition hover:text-negative"
              >
                <X size={14} />
              </button>
            )}
          </div>
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
                {eyebrowLabel}
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
                label={salesLabel}
                value={String(stats.salesCount)}
                delta={`${stats.salesCountDelta >= 0 ? '+' : ''}${stats.salesCountDelta} ${previousLabel}`}
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
