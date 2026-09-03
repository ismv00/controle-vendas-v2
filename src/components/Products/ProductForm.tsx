'use client';

import { useEffect, useMemo, useState } from 'react';
import { Product } from '@/src/types/Product';
import { ProductPrice } from '@/src/types/ProductPrice';
import { useAuth } from '@/src/contexts/AuthContext';
import { getCategoriesByUser, createCategory } from '@/src/services/categoryService';
import { PRODUCT_CATEGORIES } from '@/src/constants/productCategories';
import { formatBRL } from '@/src/lib/format';

export type ProductFormData = {
  name: string;
  category: string;
  cost: number;
  operationalExpensePercent: number;
  marginPercent: number;
  salePrice: number;
};

type Props = {
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  initialData?: Product | null;
  initialPrice?: ProductPrice | null;
};

const inputClass =
  'w-full rounded-input border border-border-input bg-surface-subtle-2 px-3 py-2.5 text-[13px] text-ink placeholder:text-placeholder focus:outline-none focus:border-accent';
const labelClass = 'mb-1.5 block text-[12px] font-semibold text-ink-2';

export function ProductForm({ onSubmit, onCancel, initialData, initialPrice }: Props) {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [cost, setCost] = useState('');
  const [operationalExpensePercent, setOperationalExpensePercent] = useState('0');
  const [marginPercent, setMarginPercent] = useState('0');

  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (!user) {
      setCategories([]);
      return;
    }

    async function loadCategories() {
      const userCategories = await getCategoriesByUser(user!.uid);

      if (user!.uid === 'wSkNQJ8eyFh6FL4E1Z51vfopnQc2') {
        setCategories(Array.from(new Set([...PRODUCT_CATEGORIES, ...userCategories])));
      } else {
        setCategories(userCategories);
      }
    }

    loadCategories();
  }, [user]);

  useEffect(() => {
    if (!initialData) {
      setName('');
      setCategory('');
      setCost('');
      setOperationalExpensePercent('0');
      setMarginPercent('0');
      return;
    }

    setName(initialData.name);
    setCost(String(initialData.cost));
    setOperationalExpensePercent(String(initialPrice?.operationalExpensePercent ?? 0));
    setMarginPercent(String(initialPrice?.marginPercent ?? 0));

    setCategories((prev) => {
      if (initialData.category && !prev.includes(initialData.category)) {
        return [...prev, initialData.category];
      }
      return prev;
    });

    setCategory(initialData.category);
  }, [initialData, initialPrice]);

  const costNumber = Number(cost) || 0;
  const expenseNumber = Number(operationalExpensePercent) || 0;
  const marginNumber = Number(marginPercent) || 0;

  const baseCost = useMemo(
    () => costNumber + costNumber * (expenseNumber / 100),
    [costNumber, expenseNumber]
  );

  const salePrice = useMemo(() => baseCost + baseCost * (marginNumber / 100), [baseCost, marginNumber]);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert('Informe o nome do produto.');
      return;
    }

    if (!category) {
      alert('Selecione uma categoria.');
      return;
    }

    onSubmit({
      name: name.trim().toUpperCase(),
      category,
      cost: costNumber,
      operationalExpensePercent: expenseNumber,
      marginPercent: marginNumber,
      salePrice,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Nome</label>
          <input
            className={inputClass}
            placeholder="Nome do produto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Categoria</label>
          <div className="flex gap-2">
            <select
              className={inputClass}
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
          </div>

          <div className="mt-2 flex gap-2">
            <input
              className={inputClass}
              placeholder="Criar nova categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="shrink-0 rounded-input border border-[#dcd8d0] bg-white px-4 text-[13px] font-semibold text-ink transition hover:border-ink-4"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Custo</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Despesa (%)</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={operationalExpensePercent}
              onChange={(e) => setOperationalExpensePercent(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Margem (%)</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={marginPercent}
              onChange={(e) => setMarginPercent(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-block border border-[#e0eae4] bg-[#f3f6f4] px-4 py-3">
          <p className="text-[12px] text-ink-2">Preço de venda sugerido</p>
          <p className="mt-1 font-mono text-[18px] font-semibold text-[#14663f]">
            {formatBRL(salePrice)}
          </p>
        </div>
      </div>

      <div className="-mx-6 -mb-5 mt-6 flex justify-end gap-2 rounded-b-modal border-t border-border-divider-2 bg-surface-subtle-2 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-input border border-[#dcd8d0] bg-white px-4 py-2 text-[13px] font-semibold text-ink transition hover:border-ink-4"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-input bg-accent px-5 py-2 text-[13px] font-semibold text-white shadow-btn transition hover:opacity-90"
        >
          {initialData ? 'Salvar alterações' : 'Cadastrar produto'}
        </button>
      </div>
    </form>
  );
}
