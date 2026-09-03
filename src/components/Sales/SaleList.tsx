import { Sale } from '@/src/types/Sale';
import { Pencil, Trash2 } from 'lucide-react';
import { Avatar } from '@/src/components/ui/Avatar';
import { formatBRL } from '@/src/lib/format';

interface Props {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (sale: Sale) => void;
}

export function SaleList({ sales, onEdit, onDelete, onToggleStatus }: Props) {
  if (!sales.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-border-divider-2 bg-surface py-16 text-center">
        <p className="text-[13px] text-mute">Nenhuma venda registrada neste período.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-border-divider-2 bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[.06em] text-ink-4">
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3 text-right">Itens</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Lucro</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((sale) => {
              const status = sale.status ?? 'paid';
              const isPaid = status === 'paid';

              return (
                <tr
                  key={sale.id}
                  className="border-t border-border-row transition hover:bg-surface-subtle-2"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={sale.clientName} size={28} />
                      <span className="font-semibold text-ink">{sale.clientName}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono text-ink-3">
                    {sale.createdAt.toLocaleDateString('pt-BR')}
                  </td>

                  <td className="px-4 py-3 text-right font-mono text-ink-2">{sale.totalItems}</td>

                  <td className="px-4 py-3 text-right font-mono text-[13px] font-semibold text-ink">
                    {formatBRL(sale.totalValue)}
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-semibold text-positive">
                    {formatBRL(sale.totalProfit)}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleStatus(sale)}
                      title="Alternar status"
                      className={`rounded-pill px-2.5 py-1 text-[11px] font-semibold transition ${
                        isPaid ? 'bg-positive-bg text-positive' : 'bg-warn-bg text-warn'
                      }`}
                    >
                      {isPaid ? 'Pago' : 'Pendente'}
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(sale)}
                        title="Editar venda"
                        className="flex h-7 w-7 items-center justify-center rounded-iconbtn border border-[#e6e3dc] text-ink-3 transition hover:border-[#dcd8d0]"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() => onDelete(sale.id)}
                        title="Excluir venda"
                        className="flex h-7 w-7 items-center justify-center rounded-iconbtn border border-negative-border text-negative transition hover:bg-negative-bg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
