'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Product, RecipeItem, StockMode } from '@/src/types/Product';
import { ProductPrice } from '@/src/types/ProductPrice';
import { Insumo } from '@/src/types/Insumo';
import { useAuth } from '@/src/contexts/AuthContext';
import { getCategoriesByUser, createCategory } from '@/src/services/categoryService';
import { PRODUCT_CATEGORIES } from '@/src/constants/productCategories';

export type ProductFormData = {
  name: string;
  category: string;
  cost: number;
  operationalExpensePercent: number;
  marginPercent: number;
  salePrice: number;
  stockMode: StockMode;
  stockQuantity: number;
  recipeItems: RecipeItem[];
  imageFile?: File | null;
  removeImage?: boolean;
};

type Props = {
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  initialData?: Product | null;
  initialPrice?: ProductPrice | null;
  insumos: Insumo[];
};

const STOCK_MODE_OPTIONS: { value: StockMode; label: string; hint: string }[] = [
  { value: 'none', label: 'Sem controle', hint: 'Feito sob encomenda, sem rastrear estoque.' },
  { value: 'direct', label: 'Estoque próprio', hint: 'Produto pronto que você revende.' },
  { value: 'recipe', label: 'Produzido (ficha técnica)', hint: 'Consome insumos ao ser vendido.' },
];

const inputClass =
  'w-full rounded-input border border-border-input bg-surface-subtle-2 px-3 py-2.5 text-[13px] text-ink placeholder:text-placeholder focus:outline-none focus:border-accent';
const labelClass = 'mb-1.5 block text-[12px] font-semibold text-ink-2';

export function ProductForm({ onSubmit, onCancel, initialData, initialPrice, insumos }: Props) {
  const { user } = useAuth();

  const [name, setName] = useState(initialData?.name ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl ?? '');
  const [removeImage, setRemoveImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [cost, setCost] = useState(initialData ? String(initialData.cost) : '');
  const [operationalExpensePercent, setOperationalExpensePercent] = useState(
    String(initialPrice?.operationalExpensePercent ?? 0)
  );
  const [marginPercent, setMarginPercent] = useState(String(initialPrice?.marginPercent ?? 0));
  const [salePriceInput, setSalePriceInput] = useState(String(initialPrice?.salePrice ?? 0));

  const [stockMode, setStockMode] = useState<StockMode>(initialData?.stockMode ?? 'none');
  const [stockQuantity, setStockQuantity] = useState(
    initialData?.stockQuantity !== undefined ? String(initialData.stockQuantity) : '0'
  );
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>(initialData?.recipeItems ?? []);
  const [pendingInsumoId, setPendingInsumoId] = useState('');
  const [pendingInsumoQty, setPendingInsumoQty] = useState('1');

  const [categories, setCategories] = useState<string[]>(
    initialData?.category ? [initialData.category] : []
  );
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadCategories() {
      const userCategories = await getCategoriesByUser(user!.uid);
      if (cancelled) return;

      const fetched =
        user!.uid === 'wSkNQJ8eyFh6FL4E1Z51vfopnQc2'
          ? Array.from(new Set([...PRODUCT_CATEGORIES, ...userCategories]))
          : userCategories;

      setCategories((prev) => Array.from(new Set([...prev, ...fetched])));
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const costNumber = Number(cost) || 0;
  const expenseNumber = Number(operationalExpensePercent) || 0;
  const marginNumber = Number(marginPercent) || 0;
  const salePrice = Number(salePriceInput) || 0;

  const baseCost = useMemo(
    () => costNumber + costNumber * (expenseNumber / 100),
    [costNumber, expenseNumber]
  );

  // Custo/Despesa mudam mantendo a margem fixa (recalcula o preço). Margem e Preço de venda
  // se alimentam um do outro: editar qualquer um dos dois recalcula o outro na hora.
  function handleCostChange(value: string) {
    setCost(value);
    const newBaseCost = (Number(value) || 0) + (Number(value) || 0) * (expenseNumber / 100);
    setSalePriceInput((newBaseCost + newBaseCost * (marginNumber / 100)).toFixed(2));
  }

  function handleExpenseChange(value: string) {
    setOperationalExpensePercent(value);
    const newExpense = Number(value) || 0;
    const newBaseCost = costNumber + costNumber * (newExpense / 100);
    setSalePriceInput((newBaseCost + newBaseCost * (marginNumber / 100)).toFixed(2));
  }

  function handleMarginChange(value: string) {
    setMarginPercent(value);
    const newMargin = Number(value) || 0;
    setSalePriceInput((baseCost + baseCost * (newMargin / 100)).toFixed(2));
  }

  function handleSalePriceChange(value: string) {
    setSalePriceInput(value);
    const newPrice = Number(value) || 0;
    const newMargin = baseCost > 0 ? ((newPrice - baseCost) / baseCost) * 100 : 0;
    setMarginPercent(newMargin.toFixed(2));
  }

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

  function handleAddRecipeItem() {
    const insumo = insumos.find((i) => i.id === pendingInsumoId);
    if (!insumo) return;

    const quantity = Math.max(0.001, Number(pendingInsumoQty) || 0);

    setRecipeItems((prev) => [
      ...prev.filter((item) => item.insumoId !== insumo.id),
      { insumoId: insumo.id, insumoName: insumo.name, quantity },
    ]);

    setPendingInsumoId('');
    setPendingInsumoQty('1');
  }

  function handleRemoveRecipeItem(insumoId: string) {
    setRecipeItems((prev) => prev.filter((item) => item.insumoId !== insumoId));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview('');
    setRemoveImage(true);
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

    if (stockMode === 'recipe' && recipeItems.length === 0) {
      alert('Adicione ao menos um insumo à ficha técnica, ou escolha outro modo de estoque.');
      return;
    }

    onSubmit({
      name: name.trim().toUpperCase(),
      category,
      cost: costNumber,
      operationalExpensePercent: expenseNumber,
      marginPercent: marginNumber,
      salePrice,
      stockMode,
      stockQuantity: Math.max(0, Number(stockQuantity) || 0),
      recipeItems: stockMode === 'recipe' ? recipeItems : [],
      imageFile,
      removeImage,
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
          <label className={labelClass}>Foto do produto</label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-block border border-border-input bg-surface-subtle-2">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon size={24} className="text-ink-4" />
              )}
            </div>

            <div className="flex flex-col items-start gap-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="rounded-input border border-[#dcd8d0] bg-white px-4 py-2 text-[13px] font-semibold text-ink transition hover:border-ink-4"
              >
                {imagePreview ? 'Trocar foto' : 'Enviar foto'}
              </button>

              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-[12px] font-medium text-ink-4 transition hover:text-negative"
                >
                  Remover foto
                </button>
              )}
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-[11.5px] text-ink-4">
            Aparece na lista de produtos e nos itens de venda/orçamento. PNG ou JPG, até 2MB.
          </p>
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
              onChange={(e) => handleCostChange(e.target.value)}
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
              onChange={(e) => handleExpenseChange(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Margem (%)</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={marginPercent}
              onChange={(e) => handleMarginChange(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-block border border-[#e0eae4] bg-[#f3f6f4] px-4 py-3">
          <label className={labelClass}>Preço de venda</label>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[18px] font-semibold text-[#14663f]">R$</span>
            <input
              type="number"
              step="0.01"
              className="w-full border-none bg-transparent font-mono text-[18px] font-semibold text-[#14663f] focus:outline-none"
              value={salePriceInput}
              onChange={(e) => handleSalePriceChange(e.target.value)}
            />
          </div>
          <p className="mt-1 text-[11px] text-ink-4">
            Altere o preço direto aqui, ou a margem acima — um recalcula o outro.
          </p>
        </div>

        <div className="rounded-block border border-border-input bg-surface-subtle-2 px-4 py-3">
          <label className={labelClass}>Controle de estoque</label>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {STOCK_MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStockMode(option.value)}
                className={`rounded-input border px-3 py-2 text-left text-[12px] font-semibold transition ${
                  stockMode === option.value
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-border-input bg-white text-ink-2 hover:border-ink-4'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <p className="mt-2 text-[11.5px] text-ink-4">
            {STOCK_MODE_OPTIONS.find((o) => o.value === stockMode)?.hint}
          </p>

          {stockMode === 'direct' && (
            <div className="mt-3 max-w-[160px]">
              <label className={labelClass}>Quantidade em estoque</label>
              <input
                type="number"
                min={0}
                step="1"
                className={inputClass}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>
          )}

          {stockMode === 'recipe' && (
            <div className="mt-3">
              <label className={labelClass}>Ficha técnica</label>

              {insumos.length === 0 ? (
                <p className="text-[12px] text-ink-4">
                  Nenhum insumo cadastrado ainda. Cadastre insumos na tela de Insumos antes de
                  montar a ficha técnica.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_100px_auto]">
                    <select
                      className={inputClass}
                      value={pendingInsumoId}
                      onChange={(e) => setPendingInsumoId(e.target.value)}
                    >
                      <option value="">Selecione um insumo</option>
                      {insumos.map((insumo) => (
                        <option key={insumo.id} value={insumo.id}>
                          {insumo.name} ({insumo.unit})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={0.001}
                      step="0.001"
                      placeholder="Qtd"
                      value={pendingInsumoQty}
                      onChange={(e) => setPendingInsumoQty(e.target.value)}
                      className={inputClass}
                    />

                    <button
                      type="button"
                      onClick={handleAddRecipeItem}
                      className="h-[42px] rounded-input border border-[#dcd8d0] bg-white px-4 text-[13px] font-semibold text-ink transition hover:border-ink-4"
                    >
                      Adicionar
                    </button>
                  </div>

                  {recipeItems.length > 0 && (
                    <div className="mt-3 divide-y divide-border-row rounded-block border border-border-input bg-white">
                      {recipeItems.map((item) => {
                        const insumo = insumos.find((i) => i.id === item.insumoId);

                        return (
                          <div
                            key={item.insumoId}
                            className="flex items-center justify-between gap-3 px-3 py-2"
                          >
                            <p className="text-[12.5px] text-ink">
                              {item.insumoName}{' '}
                              <span className="font-mono text-ink-3">
                                {item.quantity} {insumo?.unit ?? ''}
                              </span>
                            </p>

                            <button
                              type="button"
                              onClick={() => handleRemoveRecipeItem(item.insumoId)}
                              className="shrink-0 text-ink-4 transition hover:text-negative"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
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
