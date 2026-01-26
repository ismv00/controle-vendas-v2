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

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Tabela de Preços</h1>

        <button
          className="btn-primary"
          onClick={() => {
            setEditingPrice(null);
            setOpen(true);
          }}
        >
          Novo Preço
        </button>
      </div>

      {/* LISTA */}
      {loading ? (
        <p className="text-sm text-gray-500">Carregando preços...</p>
      ) : (
        <PriceList prices={prices} onEdit={handleEditPrice} onDelete={handleDeletePrice} />
      )}

      {/* MODAL */}
      <Modal
        open={open}
        title={editingPrice ? 'Editar Preço' : 'Novo Preço'}
        onClose={() => {
          setOpen(false);
          setEditingPrice(null);
        }}
      >
        <PriceForm products={products} onSubmit={handleCreatePrice} initialData={editingPrice} />
      </Modal>
    </>
  );
}
