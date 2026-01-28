import { Product } from '@/src/types/Product';
import { Pencil, Trash2 } from 'lucide-react';


interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductList({ products, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {products.length === 0 ? (
        <p className="p-6 text-sm text-gray-500">
          Nenhum produto cadastrado.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Produto</th>
              <th className="px-4 py-3 text-left">Categoria</th>
              <th className="px-4 py-3 text-left">Custo</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const cost =
                typeof product.cost === 'number'
                  ? product.cost
                  : Number(product.cost ?? 0);

              return (
                <tr key={product.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {product.name}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {product.category || '-'}
                  </td>

                  <td className="px-4 py-3">
                    R$ {cost.toFixed(2)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => onEdit(product)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Editar produto"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => onDelete(product.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Excluir produto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
