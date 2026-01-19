import { Sale } from '@/src/types/Sale';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (id: string) => void;
}

export function SaleList({ sales, onDelete, onEdit }: Props) {
  if (!sales.length) {
    return <p className="text-sm text-gray-500">Nenhuma venda registrada.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sales.map((sale) => (
        <div key={sale.id} className="bg-white border rounded-xl p-4">
          {/* CLIENTE  */}
          <h3 className="font-medium">{sale.clientName}</h3>

          {/* DATA */}
          <p className="text-xs text-gray-400 mt-1">{sale.createdAt.toLocaleDateString('pt-BR')}</p>

          {/* RESUMO */}
          <div className="mt-3 space-y-1 text-sm">
            <p>
              Itens: <span className="font-medium">{sale.totalItems}</span>
            </p>

            <p>
              Total: <span className="font-medium">R$ {sale.totalValue.toFixed(2)}</span>
            </p>

            <p className="text-green-600">
              Lucro: <span className="font-medium">R$ {sale.totalProfit.toFixed(2)}</span>
            </p>
          </div>

          <div className='flex gap-3 mt-4'>

            <button onClick={() => onEdit(sale)} className='text-blue-600 hover:text-blue-800 ' title='Editar'>
              <Pencil size={16} />
            </button>

            <button onClick={() => onDelete(sale.id)} className='text-red-600 hover:text-red-800' title='Excluir'><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
