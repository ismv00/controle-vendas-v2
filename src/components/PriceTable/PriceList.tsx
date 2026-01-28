import { ProductPrice } from '@/src/types/ProductPrice';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
    prices: ProductPrice[];
    onEdit?: (price: ProductPrice) => void;
    onDelete?: (id: string) => void;
}

export function PriceList({ prices, onEdit, onDelete }: Props) {
    if (!prices.length) {
        return (
            <p className="text-sm text-gray-500">
                Nenhum preço cadastrado.
            </p>
        );
    }

    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                    <tr>
                        <th className="px-4 py-3 text-left">Produto</th>
                        <th className="px-4 py-3 text-left">Custo</th>
                        <th className="px-4 py-3 text-left">Despesa</th>
                        <th className="px-4 py-3 text-left">Margem</th>
                        <th className="px-4 py-3 text-left">Preço de Venda</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                </thead>

                <tbody>
                    {prices.map((price) => (
                        <tr key={price.id} className="border-t">
                            <td className="px-4 py-3 font-medium text-gray-900">
                                {price.productName}
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                                R$ {price.cost.toFixed(2)}
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                                {price.operationalExpensePercent}%
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                                {price.marginPercent}%
                            </td>

                            <td className="px-4 py-3 font-semibold text-green-600">
                                R$ {price.salePrice.toFixed(2)}
                            </td>

                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-3">
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(price)}
                                            className="text-blue-600 hover:text-blue-800 transition"
                                            title="Editar preço"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    )}

                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(price.id)}
                                            className="text-red-600 hover:text-red-800 transition"
                                            title="Excluir preço"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
