'use client';

import { ShoppingCart, DollarSign, TrendingUp, BarChart3, Package, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAllProducts } from '@/src/services/productService';
import { StatCard } from './StatCard';
import { getAllClients } from '@/src/services/clientService';

const MOCK_USER_ID = 'wSkNQJ8eyFh6FL4E1Z51vfopnQc2';

export function StatsGrid() {
  const [productsCount, setProductsCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      const products = await getAllProducts(MOCK_USER_ID);
      const clients = await getAllClients(MOCK_USER_ID);
      setProductsCount(products.length);
      setClientsCount(clients.length);
    }

    loadStats();
  }, []);
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total de Vendas" value={0} icon={ShoppingCart} iconBg="bg-gray-100" />

      <StatCard
        title="Faturamento"
        value="R$ 0,00"
        valueColor="text-blue-600"
        icon={DollarSign}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
      />

      <StatCard
        title="Lucro Total"
        value="R$ 0,00"
        valueColor="text-green-600"
        icon={TrendingUp}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />

      <StatCard
        title="Margem Média"
        value="0%"
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
