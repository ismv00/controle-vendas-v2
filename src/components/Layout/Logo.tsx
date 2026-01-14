import { ShoppingCart } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-blue-600 text-white p-2 rounded-lg">
        <ShoppingCart size={22} />
      </div>

      <div className="leading-tight">
        <h1 className="text-lg font-semibold">Venda Fácil</h1>
        <span className="text-xs text-gray-500">Controle de Vendas</span>
      </div>
    </div>
  );
}
