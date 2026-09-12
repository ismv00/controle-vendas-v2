'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Modal } from '@/src/components/ui/Modal';
import { BudgetList } from '@/src/components/Budgets/BudgetList';
import { BudgetForm } from '@/src/components/Budgets/BudgetForm';

import {
  getBudgetsByUser,
  createBudget,
  updateBudget,
  deleteBudget,
} from '@/src/services/budgetService';
import { getClientsByUser, createClient } from '@/src/services/clientService';
import { getProductsByUser } from '@/src/services/productService';
import { getProductPricesByUser } from '@/src/services/priceService';
import { createSale } from '@/src/services/saleService';
import { ProductPrice } from '@/src/types/ProductPrice';
import { formatBRL } from '@/src/lib/format';

import { Budget, BudgetItem } from '@/src/types/Budget';
import { SaleItem } from '@/src/types/Sale';
import { Client } from '@/src/types/Client';
import { Product } from '@/src/types/Product';

import { useAuth } from '@/src/contexts/AuthContext';

function BudgetsPageContent() {
  const { user, loading: authLoading } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const searchParams = useSearchParams();
  const openNew = searchParams.get('novo') === 'true';
  const [open, setOpen] = useState(openNew);

  async function loadData(userId: string) {
    setLoading(true);

    const [budgetsData, clientsData, productsData, pricesData] = await Promise.all([
      getBudgetsByUser(userId),
      getClientsByUser(userId),
      getProductsByUser(userId),
      getProductPricesByUser(userId),
    ]);

    setBudgets(budgetsData);
    setClients(clientsData);
    setProducts(productsData);
    setPrices(pricesData);

    setLoading(false);
  }

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    async function fetchInitial() {
      setLoading(true);

      const [budgetsData, clientsData, productsData, pricesData] = await Promise.all([
        getBudgetsByUser(user!.uid),
        getClientsByUser(user!.uid),
        getProductsByUser(user!.uid),
        getProductPricesByUser(user!.uid),
      ]);

      if (cancelled) return;

      setBudgets(budgetsData);
      setClients(clientsData);
      setProducts(productsData);
      setPrices(pricesData);
      setLoading(false);
    }

    void fetchInitial();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  async function handleSaveBudget(data: {
    clientId: string | null;
    clientName: string;
    clientPhone: string;
    items: BudgetItem[];
    totalItems: number;
    totalValue: number;
  }) {
    if (!user) return;

    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, data);
      } else {
        await createBudget({ ...data, userId: user.uid });
      }

      setOpen(false);
      setEditingBudget(null);
      await loadData(user.uid);
    } catch (err) {
      console.error(err);
      alert('Não foi possível salvar o orçamento. Tente novamente.');
    }
  }

  async function handleConvertToSale(budget: Budget) {
    if (!user || budget.convertedSaleId) return;

    const confirmConvert = confirm(
      `Transformar o orçamento de "${budget.clientName}" em venda? A data da venda será a de hoje.`
    );
    if (!confirmConvert) return;

    try {
      let clientId = budget.clientId;

      if (!clientId) {
        clientId = await createClient({
          name: budget.clientName,
          fantasy: '',
          address: '',
          phone: budget.clientPhone,
          userId: user.uid,
        });
      }

      const saleItems: SaleItem[] = budget.items.map((item) => {
        const price = prices.find((p) => p.productId === item.productId);
        const baseCost = price ? price.baseCost : 0;
        const profit = Number((item.subtotal - baseCost * item.quantity).toFixed(2));

        return {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          baseCost,
          basePrice: item.unitPrice,
          price: item.unitPrice,
          discountPercent: 0,
          subtotal: item.subtotal,
          profit,
        };
      });

      const totalCost = saleItems.reduce((sum, i) => sum + i.baseCost * i.quantity, 0);
      const totalProfit = Number((budget.totalValue - totalCost).toFixed(2));

      // createSale grava createdAt como a data de agora — a venda não herda a data do orçamento.
      const saleId = await createSale({
        clientId,
        clientName: budget.clientName,
        items: saleItems,
        totalItems: budget.totalItems,
        totalValue: budget.totalValue,
        totalCost,
        totalProfit,
        userId: user.uid,
      });

      await updateBudget(budget.id, { convertedSaleId: saleId });
      await loadData(user.uid);
    } catch (err) {
      console.error(err);
      alert('Não foi possível transformar o orçamento em venda. Tente novamente.');
    }
  }

  async function handleDeleteBudget(id: string) {
    const confirmDelete = confirm('Deseja realmente excluir este orçamento?');
    if (!confirmDelete) return;

    try {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      alert('Não foi possível excluir o orçamento. Tente novamente.');
    }
  }

  const totalOpen = budgets.reduce((sum, b) => sum + b.totalValue, 0);

  return (
    <div className="animate-vf-in space-y-5">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-bold tracking-[-.025em] text-ink">Orçamentos</h1>
          <p className="mt-1 text-[13.5px] text-ink-3">
            {budgets.length} orçamentos · {formatBRL(totalOpen)} em orçamentos
          </p>
        </div>

        <button
          className="rounded-input bg-accent px-4 py-[9px] text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90"
          onClick={() => {
            setEditingBudget(null);
            setOpen(true);
          }}
        >
          + Novo orçamento
        </button>
      </div>

      {loading ? (
        <p className="text-[13px] text-mute">Carregando orçamentos...</p>
      ) : (
        <BudgetList
          budgets={budgets}
          onDelete={handleDeleteBudget}
          onConvert={handleConvertToSale}
          onEdit={(budget) => {
            setEditingBudget(budget);
            setOpen(true);
          }}
        />
      )}

      <Modal
        open={open}
        title={editingBudget ? 'Editar orçamento' : 'Novo orçamento'}
        subtitle="O cliente pode ser cadastrado ou digitado na hora."
        maxWidth={680}
        onClose={() => {
          setOpen(false);
          setEditingBudget(null);
        }}
      >
        <BudgetForm
          key={editingBudget?.id ?? 'new'}
          clients={clients}
          products={products}
          prices={prices}
          initialData={editingBudget}
          onSubmit={handleSaveBudget}
          onCancel={() => {
            setOpen(false);
            setEditingBudget(null);
          }}
        />
      </Modal>
    </div>
  );
}

export default function BudgetsPage() {
  return (
    <Suspense fallback={<p className="text-[13px] text-mute">Carregando...</p>}>
      <BudgetsPageContent />
    </Suspense>
  );
}
