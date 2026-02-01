import { Sale } from '@/src/types/Sale';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (id: string) => void;
}

function calculateProfit(sale: Sale) {
  if (!sale.items || sale.items.length === 0) return 0;

  const totalCost = sale.items.reduce((sum, item) => sum + item.baseCost * item.quantity, 0)

  return sale.totalValue - totalCost;
}

export function SaleList({ sales, onEdit, onDelete }: Props) {
  if (!sales.length) {
    return (
      <p className="text-sm text-gray-500">
        Nenhuma venda registrada.
      </p>
    );
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="px-4 py-3 text-left">Cliente</th>
            <th className="px-4 py-3 text-left">Data</th>
            <th className="px-4 py-3 text-left">Itens</th>
            <th className="px-4 py-3 text-left">Total</th>
            <th className="px-4 py-3 text-left">Lucro</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>

        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="border-t">
              <td className="px-4 py-3 font-medium text-gray-900">
                {sale.clientName}
              </td>

              <td className="px-4 py-3 text-gray-500">
                {sale.createdAt.toLocaleDateString('pt-BR')}
              </td>

              <td className="px-4 py-3">
                {sale.totalItems}
              </td>

              <td className="px-4 py-3 font-medium">
                R$ {sale.totalValue.toFixed(2)}
              </td>

              {(() => {
                const profit = calculateProfit(sale);

                return (
                  <td
                    className={`px-4 py-3 font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    R$ {profit.toFixed(2)}
                  </td>
                );
              })()}

              <td className="px-4 py-3">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => onEdit(sale)}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="Editar venda"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => onDelete(sale.id)}
                    className="text-red-600 hover:text-red-800 transition"
                    title="Excluir venda"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
