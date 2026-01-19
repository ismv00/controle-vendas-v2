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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prices.map((price) => (
                <div
                    key={price.id}
                    className="bg-white border rounded-xl p-4 space-y-3"
                >
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium">
                            {price.productName}
                        </h3>

                        <div className="flex gap-2">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(price)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Editar"
                                >
                                    <Pencil size={16} />
                                </button>
                            )}

                            {onDelete && (
                                <button
                                    onClick={() => onDelete(price.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Excluir"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                        <p>
                            Custo:{' '}
                            <span className="font-medium">
                                R$ {price.cost.toFixed(2)}
                            </span>
                        </p>

                        <p>
                            Despesa:{' '}
                            <span className="font-medium">
                                {price.operationalExpensePercent}%
                            </span>
                        </p>

                        <p>
                            Margem:{' '}
                            <span className="font-medium">
                                {price.marginPercent}%
                            </span>
                        </p>
                    </div>

                    <div className="pt-2 border-t text-sm">
                        <p className="text-green-600">
                            Preço de venda:{' '}
                            <span className="font-semibold">
                                R$ {price.salePrice.toFixed(2)}
                            </span>
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
