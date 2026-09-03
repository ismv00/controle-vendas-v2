import { Product } from '@/src/types/Product';
import { ProductPrice } from '@/src/types/ProductPrice';
import { Pencil, Trash2, Package } from 'lucide-react';
import { formatBRL } from '@/src/lib/format';

interface Props {
  products: Product[];
  prices: ProductPrice[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const MARGIN_THRESHOLD = 60;

export function ProductList({ products, prices, onEdit, onDelete }: Props) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-border-divider-2 bg-surface py-20 text-center">
        <Package size={40} className="mb-3 text-mute-2" />
        <p className="text-[13px] text-mute">Nenhum produto cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const price = prices.find((p) => p.productId === product.id);
        const lowMargin = price ? price.marginPercent < MARGIN_THRESHOLD : false;

        return (
          <div
            key={product.id}
            className="rounded-card border border-border-divider-2 bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-ink">{product.name}</p>
                <p className="text-[11.5px] text-mute">{product.category || 'Sem categoria'}</p>
              </div>

              {price ? (
                <span
                  className={`shrink-0 rounded-pill px-2 py-[3px] text-[10.5px] font-semibold uppercase tracking-[.04em] ${
                    lowMargin ? 'bg-warn-bg text-warn-2' : 'bg-[#eef1ef] text-ink-2'
                  }`}
                >
                  {lowMargin ? 'Revisar margem' : 'Ativo'}
                </span>
              ) : (
                <span className="shrink-0 rounded-pill bg-[#eef1ef] px-2 py-[3px] text-[10.5px] font-semibold uppercase tracking-[.04em] text-ink-3">
                  Sem preço
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border-divider-2 pt-3">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[.06em] text-ink-4">
                  Custo
                </p>
                <p className="mt-1 font-mono text-[14px] text-ink">{formatBRL(product.cost)}</p>
              </div>

              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[.06em] text-ink-4">
                  Venda
                </p>
                <p className="mt-1 font-mono text-[14px] text-ink">
                  {price ? formatBRL(price.salePrice) : '—'}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10.5px] font-semibold uppercase tracking-[.06em] text-ink-4">
                  Margem
                </p>
                <p
                  className={`mt-1 font-mono text-[14px] ${
                    !price ? 'text-mute' : lowMargin ? 'text-negative' : 'text-positive'
                  }`}
                >
                  {price ? `${price.marginPercent}%` : '—'}
                </p>
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2 border-t border-border-divider-2 pt-3">
              <button
                onClick={() => onEdit(product)}
                title="Editar produto"
                className="flex h-7 w-7 items-center justify-center rounded-iconbtn border border-[#e6e3dc] text-ink-3 transition hover:border-[#dcd8d0]"
              >
                <Pencil size={14} />
              </button>

              <button
                onClick={() => onDelete(product.id)}
                title="Excluir produto"
                className="flex h-7 w-7 items-center justify-center rounded-iconbtn border border-negative-border text-negative transition hover:bg-negative-bg"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
