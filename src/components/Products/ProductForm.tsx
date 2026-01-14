'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/src/types/Product';
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
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [cost, setCost] = useState('');

  // 👉 Preenche o formulário quando for edição
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setCost(String(initialData.cost));
    } else {
      setName('');
      setCategory('');
      setCost('');
    }
  }, [initialData]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    onSubmit({
      name: name.trim().toUpperCase(),
      category,
      cost: Number(cost),
    });
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

      <select
        className="w-full border rounded-lg px-3 py-2"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      >
        <option value="">Selecione uma categoria</option>
        {PRODUCT_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

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
