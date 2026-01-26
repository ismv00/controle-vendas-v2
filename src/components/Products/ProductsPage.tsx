'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { ProductForm } from '@/src/components/Products/ProductForm';
import { ProductList } from '@/src/components/Products/ProductList';
import {
  createProduct,
  getProductsByUser,
  updateProduct,
  deleteProduct,
} from '@/src/services/productService';
import { Product } from '@/src/types/Product';
import { useAuth } from '@/src/contexts/AuthContext';

export default function ProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const data = await getProductsByUser(user.uid);
    setProducts(data);
    setLoading(false);
  }, [user]);

  async function handleAddOrEditProduct(data: { name: string; category: string; cost: number }) {
    if (!user) return;

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: data.name,
        category: data.category,
        cost: data.cost,
      });
    } else {
      await createProduct({
        name: data.name,
        category: data.category,
        cost: data.cost,
        userId: user.uid,
        createdAt: new Date(),
      });
    }

    await loadProducts();
    setOpen(false);
    setEditingProduct(null);
  }

  async function handleDeleteProduct(id: string) {
    const confirmed = confirm('Tem certeza que deseja excluir este produto?');

    if (!confirmed) return;

    await deleteProduct(id);

    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    async function fetchProducts() {
      if (!user) return;
      setLoading(true);
      const data = await getProductsByUser(user.uid);
      if (!cancelled) {
        setProducts(data);
        setLoading(false);
      }
    }

    void fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Produtos</h1>

        <button onClick={() => setOpen(true)} className="btn-primary">
          Novo Produto
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-sm text-gray-500">Carregando produtos...</p>
      ) : (
        <ProductList
          products={products}
          onEdit={(product) => {
            setEditingProduct(product);
            setOpen(true);
          }}
          onDelete={handleDeleteProduct}
        />
      )}

      {/* Modal */}
      <Modal
        open={open}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
        onClose={() => {
          setOpen(false);
          setEditingProduct(null);
        }}
      >
        <ProductForm onSubmit={handleAddOrEditProduct} initialData={editingProduct} />
      </Modal>
    </>
  );
}
