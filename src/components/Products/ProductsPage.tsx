'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Modal } from '../ui/Modal';
import { ProductForm, ProductFormData } from '@/src/components/Products/ProductForm';
import { ProductList } from '@/src/components/Products/ProductList';
import {
  createProduct,
  getProductsByUser,
  updateProduct,
  deleteProduct,
} from '@/src/services/productService';
import {
  getProductPricesByUser,
  createProductPrice,
  updateProductPrice,
} from '@/src/services/priceService';
import { Product } from '@/src/types/Product';
import { ProductPrice } from '@/src/types/ProductPrice';
import { useAuth } from '@/src/contexts/AuthContext';

export default function ProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<ProductPrice[]>([]);

  const searchParams = useSearchParams();
  const openNew = searchParams.get('novo') === 'true';

  const [open, setOpen] = useState(openNew);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const [productsData, pricesData] = await Promise.all([
      getProductsByUser(user.uid),
      getProductPricesByUser(user.uid),
    ]);
    setProducts(productsData);
    setPrices(pricesData);
    setLoading(false);
  }, [user]);

  async function handleAddOrEditProduct(data: ProductFormData) {
    if (!user) return;

    let productId = editingProduct?.id;

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: data.name,
        category: data.category,
        cost: data.cost,
      });
    } else {
      productId = await createProduct({
        name: data.name,
        category: data.category,
        cost: data.cost,
        userId: user.uid,
        createdAt: new Date(),
      });
    }

    if (productId) {
      const existingPrice = prices.find((p) => p.productId === productId);
      const pricePayload = {
        productId,
        productName: data.name,
        baseCost: data.cost + data.cost * (data.operationalExpensePercent / 100),
        operationalExpensePercent: data.operationalExpensePercent,
        marginPercent: data.marginPercent,
        salePrice: data.salePrice,
      };

      if (existingPrice) {
        await updateProductPrice(existingPrice.id, pricePayload);
      } else {
        await createProductPrice({ ...pricePayload, userId: user.uid });
      }
    }

    await loadData();
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

    void fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const withoutPrice = products.filter((p) => !prices.some((price) => price.productId === p.id)).length;

  return (
    <div className="animate-vf-in space-y-5">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-bold tracking-[-.025em] text-ink">Produtos</h1>
          <p className="mt-1 text-[13.5px] text-ink-3">
            {products.length} itens
            {withoutPrice > 0 ? ` · ${withoutPrice} sem preço definido` : ''}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setOpen(true);
          }}
          className="rounded-input bg-accent px-4 py-[9px] text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90"
        >
          + Novo produto
        </button>
      </div>

      {loading ? (
        <p className="text-[13px] text-mute">Carregando produtos...</p>
      ) : (
        <ProductList
          products={products}
          prices={prices}
          onEdit={(product) => {
            setEditingProduct(product);
            setOpen(true);
          }}
          onDelete={handleDeleteProduct}
        />
      )}

      <Modal
        open={open}
        title={editingProduct ? 'Editar produto' : 'Novo produto'}
        subtitle="Informe custo e margem — o preço de venda é sugerido."
        maxWidth={560}
        onClose={() => {
          setOpen(false);
          setEditingProduct(null);
        }}
      >
        <ProductForm
          onSubmit={handleAddOrEditProduct}
          onCancel={() => {
            setOpen(false);
            setEditingProduct(null);
          }}
          initialData={editingProduct}
          initialPrice={editingProduct ? prices.find((p) => p.productId === editingProduct.id) : null}
        />
      </Modal>
    </div>
  );
}
