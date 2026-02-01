'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/src/types/Product';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  getCategoriesByUser,
  createCategory,
} from '@/src/services/categoryService';

import { PRODUCT_CATEGORIES } from '@/src/constants/productCategories';

type ProductFormData = {
  name: string;
  category: string;
  cost: number;
};

type Props = {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product | null;
};

export function ProductForm({ onSubmit, initialData }: Props) {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [cost, setCost] = useState('');

  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  /* =====================
     CARREGAR CATEGORIAS DO USUÁRIO
     ===================== */
  useEffect(() => {
    if (!user) {
      setCategories([]);
      return;
    }

    async function loadCategories() {
      const userCategories = await getCategoriesByUser(user!.uid);

      // 👑 usuário especial
      if (user!.uid === 'wSkNQJ8eyFh6FL4E1Z51vfopnQc2') {
        const merged = Array.from(
          new Set([...PRODUCT_CATEGORIES, ...userCategories])
        );
        setCategories(merged);
      } else {
        setCategories(userCategories);
      }
    }

    loadCategories();
  }, [user]);

  /* =====================
     EDIÇÃO
     ===================== */
  useEffect(() => {
    if (!initialData) {
      setName('');
      setCategory('');
      setCost('');
      return;
    }

    setName(initialData.name);
    setCost(String(initialData.cost));

    // 👉 se for o usuário especial, garante categorias da constant
    if (user?.uid === 'wSkNQJ8eyFh6FL4E1Z51vfopnQc2') {
      setCategories((prev) => {
        const merged = [...prev];

        PRODUCT_CATEGORIES.forEach((cat) => {
          if (!merged.includes(cat)) {
            merged.push(cat);
          }
        });

        return merged;
      });
    }

    // 👉 garante que a categoria do produto exista no select
    setCategories((prev) => {
      if (
        initialData.category &&
        !prev.includes(initialData.category)
      ) {
        return [...prev, initialData.category];
      }
      return prev;
    });

    setCategory(initialData.category);
  }, [initialData, user]);

  /* =====================
     SUBMIT
     ===================== */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    onSubmit({
      name: name.trim().toUpperCase(),
      category,
      cost: Number(cost),
    });
  }

  /* =====================
     CRIAR NOVA CATEGORIA
     ===================== */
  async function handleAddCategory() {
    if (!newCategory.trim() || !user) return;

    const formatted = newCategory.trim();

    if (!categories.includes(formatted)) {
      await createCategory(user.uid, formatted);
      setCategories((prev) => [...prev, formatted]);
    }

    setCategory(formatted);
    setNewCategory('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Nome do produto"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {/* CATEGORIA */}
      <select
        className="w-full border rounded-lg px-3 py-2"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      >
        <option value="">Selecione uma categoria</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* NOVA CATEGORIA */}
      <div className="flex gap-2">
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Criar nova categoria"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />

        <button
          type="button"
          className="btn-secondary"
          onClick={handleAddCategory}
        >
          +
        </button>
      </div>

      {/* CUSTO */}
      <input
        type="number"
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Custo"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        required
      />

      <button type="submit" className="btn-primary w-full">
        {initialData ? 'Salvar Alterações' : 'Salvar Produto'}
      </button>
    </form>
  );
}
