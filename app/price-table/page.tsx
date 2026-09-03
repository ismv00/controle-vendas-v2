'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';

import { PriceForm } from '@/src/components/PriceTable/PriceForm';
import { PriceList } from '@/src/components/PriceTable/PriceList';

import { getProductsByUser } from '@/src/services/productService';
import {
  getProductPricesByUser,
  createProductPrice,
  deleteProductPrice,
  updateProductPrice,
} from '@/src/services/priceService';

import { Product } from '@/src/types/Product';
import { ProductPrice } from '@/src/types/ProductPrice';
import { ProductPriceFormData } from '@/src/types/ProductPriceForm';

import { useAuth } from '@/src/contexts/AuthContext';

export default function PriceTablePage() {
  const { user, loading: authLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editingPrice, setEditingPrice] = useState<ProductPrice | null>(null);

  async function loadData() {
    if (!user) return;

    setLoading(true);

    const [productsData, pricesData] = await Promise.all([
      getProductsByUser(user.uid),
      getProductPricesByUser(user.uid),
    ]);

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

      const [productsData, pricesData] = await Promise.all([
        getProductsByUser(user.uid),
        getProductPricesByUser(user.uid),
      ]);

      if (!cancelled) {
        setProducts(productsData);
        setPrices(pricesData);
        setLoading(false);
      }
    }

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  async function handleCreatePrice(data: ProductPriceFormData) {
    if (!user) return;

    if (editingPrice) {
      await updateProductPrice(editingPrice.id, data);
    } else {
      await createProductPrice({
        ...data,
        userId: user.uid,
      });
    }

    setOpen(false);
    setEditingPrice(null);
    loadData();
  }

  async function handleDeletePrice(id: string) {
    const confirm = window.confirm('Deseja realmente excluir este preço?');
    if (!confirm) return;

    await deleteProductPrice(id);
    loadData();
  }

  function handleEditPrice(price: ProductPrice) {
    setEditingPrice(price);
    setOpen(true);
  }

  const negativeCount = prices.filter((p) => {
    const expense = p.baseCost * (p.operationalExpensePercent / 100);
    return p.salePrice - p.baseCost - expense < 0;
  }).length;

  return (
    <div className="animate-vf-in space-y-5">
      {/* HEADER */}
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-bold tracking-[-.025em] text-ink">Tabela de Preços</h1>
          <p className="mt-1 text-[13.5px] text-ink-3">
            Custo, despesa e margem por produto
            {negativeCount > 0 ? ` · ${negativeCount} itens com lucro negativo` : ''}
          </p>
        </div>

        <button
          className="rounded-input bg-accent px-4 py-[9px] text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90"
          onClick={() => {
            setEditingPrice(null);
            setOpen(true);
          }}
        >
          + Novo preço
        </button>
      </div>

      {/* LISTA */}
      {loading ? (
        <p className="text-[13px] text-mute">Carregando preços...</p>
      ) : (
        <PriceList prices={prices} onEdit={handleEditPrice} onDelete={handleDeletePrice} />
      )}

      {/* MODAL */}
      <Modal
        open={open}
        title={editingPrice ? 'Editar preço' : 'Novo preço'}
        subtitle="Informe custo e margem — o preço de venda é sugerido."
        maxWidth={560}
        onClose={() => {
          setOpen(false);
          setEditingPrice(null);
        }}
      >
        <PriceForm
          products={products}
          onSubmit={handleCreatePrice}
          onCancel={() => {
            setOpen(false);
            setEditingPrice(null);
          }}
          initialData={editingPrice}
        />
      </Modal>
    </div>
  );
}
