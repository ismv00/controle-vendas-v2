'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Modal } from '@/src/components/ui/Modal';
import { SaleList } from '@/src/components/Sales/SaleList';
import { SaleForm } from '@/src/components/Sales/SaleForm';

import { getSalesByUser, deleteSale, createSale, updateSale } from '@/src/services/saleService';
import { getClientsByUser } from '@/src/services/clientService';
import { getProductsByUser } from '@/src/services/productService';
import { getProductPricesByUser } from '@/src/services/priceService';
import { ProductPrice } from '@/src/types/ProductPrice';
import { formatBRL } from '@/src/lib/format';

import { Sale, SaleItem } from '@/src/types/Sale';
import { Client } from '@/src/types/Client';
import { Product } from '@/src/types/Product';

import { useAuth } from '@/src/contexts/AuthContext';

function SalesPageContent() {
  const { user, loading: authLoading } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const [prices, setPrices] = useState<ProductPrice[]>([]);

  const searchParams = useSearchParams();
  const openNew = searchParams.get('novo') === 'true';
  const [open, setOpen] = useState(openNew);

  async function loadData(userId: string) {
    setLoading(true);

    const [salesData, clientsData, productsData, pricesData] = await Promise.all([
      getSalesByUser(userId),
      getClientsByUser(userId),
      getProductsByUser(userId),
      getProductPricesByUser(userId),
    ]);

    setSales(salesData);
    setClients(clientsData);
    setProducts(productsData);
    setPrices(pricesData);

    setLoading(false);
  }

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    async function fetchData() {
      if (!user) return;

      setLoading(true);

      const [salesData, clientsData, productsData, pricesData] = await Promise.all([
        getSalesByUser(user.uid),
        getClientsByUser(user.uid),
        getProductsByUser(user.uid),
        getProductPricesByUser(user.uid),
      ]);

      if (!cancelled) {
        setSales(salesData);
        setClients(clientsData);
        setProducts(productsData);
        setPrices(pricesData);
        setLoading(false);
      }
    }

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  async function handleSaveSale(data: {
    clientId: string;
    clientName: string;
    items: SaleItem[];
    totalItems: number;
    totalValue: number;
    totalProfit: number;
  }) {
    const totalCost = data.items.reduce((sum, item) => sum + item.baseCost * item.quantity, 0);

    if (editingSale) {
      await updateSale(editingSale.id, {
        ...data,
        totalCost,
      });

      setSales((prev) =>
        prev.map((s) => (s.id === editingSale.id ? { ...s, ...data, totalCost } : s))
      );
    } else {
      await createSale({
        ...data,
        totalCost,
        userId: user!.uid,
      });

      loadData(user!.uid);
    }

    setEditingSale(null);
    setOpen(false);
  }

  async function handleDeleteSale(id: string) {
    const confirmDelete = confirm('Deseja realmente excluir esta venda?');
    if (!confirmDelete) return;

    deleteSale(id)
      .then(() => {
        setSales((prev) => prev.filter((sale) => sale.id !== id));
      })
      .catch((error) => {
        console.error(error);
        alert('Erro ao excluir a venda');
      });
  }

  async function handleToggleStatus(sale: Sale) {
    const nextStatus = (sale.status ?? 'paid') === 'paid' ? 'pending' : 'paid';

    setSales((prev) => prev.map((s) => (s.id === sale.id ? { ...s, status: nextStatus } : s)));

    await updateSale(sale.id, { status: nextStatus });
  }

  const summary = useMemo(() => {
    const totalValue = sales.reduce((sum, s) => sum + s.totalValue, 0);
    const totalProfit = sales.reduce((sum, s) => sum + s.totalProfit, 0);
    const totalItems = sales.reduce((sum, s) => sum + s.totalItems, 0);
    const avgTicket = sales.length > 0 ? totalValue / sales.length : 0;

    return { totalValue, totalProfit, totalItems, avgTicket };
  }, [sales]);

  return (
    <div className="animate-vf-in space-y-5">
      {/* HEADER */}
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-bold tracking-[-.025em] text-ink">Vendas</h1>
          <p className="mt-1 text-[13.5px] text-ink-3">
            {sales.length} vendas · ticket médio {formatBRL(summary.avgTicket)}
          </p>
        </div>

        <button
          className="rounded-input bg-accent px-4 py-[9px] text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90"
          onClick={() => setOpen(true)}
        >
          + Nova venda
        </button>
      </div>

      {/* RESUMO */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="rounded-card border border-border-divider-2 bg-surface p-4">
          <p className="text-[11.5px] text-ink-3">Total faturado</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold tracking-[-.02em] text-ink">
            {formatBRL(summary.totalValue)}
          </p>
        </div>

        <div className="rounded-card border border-border-divider-2 bg-surface p-4">
          <p className="text-[11.5px] text-ink-3">Lucro acumulado</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold tracking-[-.02em] text-positive">
            {formatBRL(summary.totalProfit)}
          </p>
        </div>

        <div className="rounded-card border border-border-divider-2 bg-surface p-4">
          <p className="text-[11.5px] text-ink-3">Itens vendidos</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold tracking-[-.02em] text-ink">
            {summary.totalItems.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* LISTA */}
      {loading ? (
        <p className="text-[13px] text-mute">Carregando vendas...</p>
      ) : (
        <SaleList
          sales={sales}
          onDelete={handleDeleteSale}
          onToggleStatus={handleToggleStatus}
          onEdit={(sale) => {
            setEditingSale(sale);
            setOpen(true);
          }}
        />
      )}

      {/* MODAL */}
      <Modal
        open={open}
        title={editingSale ? 'Editar venda' : 'Nova venda'}
        subtitle="O lucro é calculado a partir da tabela de preços."
        maxWidth={680}
        onClose={() => {
          setOpen(false);
          setEditingSale(null);
        }}
      >
        <SaleForm
          clients={clients}
          products={products}
          prices={prices}
          initialData={editingSale}
          onSubmit={handleSaveSale}
          onCancel={() => {
            setOpen(false);
            setEditingSale(null);
          }}
        />
      </Modal>
    </div>
  );
}

export default function SalesPage() {
  return (
    <Suspense fallback={<p className="text-[13px] text-mute">Carregando...</p>}>
      <SalesPageContent />
    </Suspense>
  );
}
