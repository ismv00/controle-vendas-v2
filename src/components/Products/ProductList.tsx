import { Product } from '@/src/types/Product';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductList({ products, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => {
        const cost = typeof product.cost === 'number' ? product.cost : Number(product.cost ?? 0);

        return (
          <div key={product.id} className="bg-white border rounded-xl p-4">
            <h3 className="font-medium">{product.name}</h3>

            <p className="text-sm text-gray-500">R$ {cost.toFixed(2)}</p>

            <p className="text-xs text-gray-400">{product.category}</p>

            <div className="flex gap-2 py-2">
              <button
                className="text-sm text-blue-600 hover:text-blue-800 transition"
                onClick={() => onEdit(product)}
                title="Editar Produto"
              >
                <Pencil size={16} />
              </button>

              <button
                className="text-sm text-red-600 hover:text-red-800 transition"
                onClick={() => onDelete(product.id)}
                title="Excluir Produto"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
