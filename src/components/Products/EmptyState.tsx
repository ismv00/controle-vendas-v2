import { Package } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
      <Package size={48} className="mb-4 text-gray-300" />
      <p className="text-sm">Nenhum produto cadastrado ainda.</p>
      <br />
      Clique em <strong>Novo Produto</strong> para começar.
    </div>
  );
}
