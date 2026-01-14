import { Package } from 'lucide-react';

type Props = {
  onNewProduct: () => void;
};

export function ProductsHeader({ onNewProduct }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">Produtos</h2>
        <p className="text-sm text-gray-500">Gerencie seus produtos cadastrados</p>
      </div>

      <button className="btn-primary flex items-center gap-2" onClick={onNewProduct}>
        <Package size={16} />
        Novo Produto
      </button>
    </div>
  );
}
