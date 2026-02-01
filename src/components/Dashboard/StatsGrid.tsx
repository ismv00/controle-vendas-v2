'use client';

import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  BarChart3,
  Package,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { getAllProducts } from '@/src/services/productService';
import { getAllClients } from '@/src/services/clientService';
import { getAllSales } from '@/src/services/saleService';
import { useAuth } from '@/src/contexts/AuthContext';
import { StatCard } from './StatCard';

type Period = 'today' | 'month' | 'lastMonth' | 'year' | 'all';

interface Props {
  period: Period;
}

export function StatsGrid({ period }: Props) {
  const { user, loading: authLoading } = useAuth();

  const [productsCount, setProductsCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [salesCount, setSalesCount] = useState(0);

  const [revenue, setRevenue] = useState(0);
  const [profit, setProfit] = useState(0);
  const [margin, setMargin] = useState(0);

  function isSaleInPeriod(date: Date, period: Period) {
    const now = new Date();

    if (period === 'all') return true;

    if (period === 'today') {
      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    if (period === 'month') {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    if (period === 'lastMonth') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      return (
        date.getMonth() === lastMonth.getMonth() &&
        date.getFullYear() === lastMonth.getFullYear()
      );
    }

    if (period === 'year') {
      return date.getFullYear() === now.getFullYear();
    }

    return true;
  }


  function calculateSaleProfit(sale: any) {
    if (!sale.items || sale.items.length === 0) return 0;

    const totalCost = sale.items.reduce(
      (sum: number, item: any) => sum + item.baseCost * item.quantity, 0
    )

    return sale.totalValue - totalCost
  }

  useEffect(() => {
    if (authLoading || !user) return;

    async function loadStats() {
      const userId = user!.uid;

      const [products, clients, sales] = await Promise.all([
        getAllProducts(userId),
        getAllClients(userId),
        getAllSales(userId),
      ]);

      setProductsCount(products.length);
      setClientsCount(clients.length);

      const filteredSales = sales.filter((sale) =>
        isSaleInPeriod(new Date(sale.createdAt), period)
      );

      setSalesCount(filteredSales.length);

      const totalRevenue = filteredSales.reduce(
        (sum, sale) => sum + sale.totalValue,
        0
      );

      const totalProfit = filteredSales.reduce(
        (sum, sale) => sum + calculateSaleProfit(sale),
        0
      );

      const marginPercent =
        totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      setRevenue(totalRevenue);
      setProfit(totalProfit);
      setMargin(marginPercent);
    }

    loadStats();
  }, [period, user, authLoading]);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total de Vendas"
        value={salesCount}
        icon={ShoppingCart}
        iconBg="bg-gray-100"
      />

      <StatCard
        title="Faturamento"
        value={`R$ ${revenue.toFixed(2)}`}
        valueColor="text-blue-600"
        icon={DollarSign}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
      />

      <StatCard
        title="Lucro Total"
        value={`R$ ${profit.toFixed(2)}`}
        valueColor="text-green-600"
        icon={TrendingUp}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />

      <StatCard
        title="Margem Média"
        value={`${margin.toFixed(1)}%`}
        valueColor="text-green-600"
        icon={BarChart3}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />

      <StatCard
        title="Produtos Cadastrados"
        value={productsCount}
        icon={Package}
        iconBg="bg-gray-100"
      />

      <StatCard
        title="Clientes Cadastrados"
        value={clientsCount}
        icon={Users}
        iconBg="bg-gray-100"
      />
    </section>
  );
}
