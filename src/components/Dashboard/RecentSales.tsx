'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { getSalesByUser } from '@/src/services/saleService';
import { Sale } from '@/src/types/Sale';

type Period = 'today' | 'month' | 'lastMonth' | 'year' | 'all';

interface Props {
    period: Period;
}

export function RecentSales({ period }: Props) {
    const { user } = useAuth();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    function isSaleInPeriod(date: Date, period: Period) {
        const now = new Date();

        if (period === 'all') return true;

        if (period === 'today') {
            return (
                date.getDate() === now.getDate() &&
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
            );
        }

        if (period === 'month') {
            return (
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
            );
        }

        if (period === 'lastMonth') {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

            return (
                date.getMonth() === lastMonth.getMonth() &&
                date.getFullYear() === lastMonth.getFullYear()
            );
        }


        if (period === 'year') {
            return date.getFullYear() === now.getFullYear();
        }

        return true;
    }

    useEffect(() => {
        if (!user) return;

        async function fetchSales() {
            setLoading(true);

            const allSales = await getSalesByUser(user!.uid);

            const filtered = allSales.filter((sale) =>
                isSaleInPeriod(sale.createdAt, period)
            );

            setSales(filtered);
            setLoading(false);
        }

        fetchSales();
    }, [user, period]);

    function calculateProfit(sale: Sale) {
        if (!sale.items || sale.items.length === 0) return 0;

        const totalCost = sale.items.reduce(
            (sum, item) => sum + item.baseCost * item.quantity,
            0
        );

        return sale.totalValue - totalCost;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
                Vendas recentes
            </h2>

            <div className="bg-white rounded-xl border overflow-hidden">
                {loading ? (
                    <p className="p-6 text-sm text-gray-500">
                        Carregando vendas...
                    </p>
                ) : sales.length === 0 ? (
                    <p className="p-6 text-sm text-gray-500">
                        Nenhuma venda registrada neste período.
                    </p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-4 py-3 text-left">Data</th>
                                <th className="px-4 py-3 text-left">Cliente</th>
                                <th className="px-4 py-3 text-left">Total</th>
                                <th className="px-4 py-3 text-left">Lucro</th>
                                <th className="px-4 py-3 text-left">Margem</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sales.map((sale) => {
                                const margin =
                                    sale.totalValue > 0
                                        ? (sale.totalProfit / sale.totalValue) * 100
                                        : 0;

                                return (
                                    <tr key={sale.id} className="border-t">
                                        <td className="px-4 py-3">
                                            {sale.createdAt.toLocaleDateString('pt-BR')}
                                        </td>

                                        <td className="px-4 py-3">
                                            {sale.clientName}
                                        </td>

                                        <td className="px-4 py-3 font-medium">
                                            R$ {sale.totalValue.toFixed(2)}
                                        </td>

                                        {(() => {
                                            const profit = calculateProfit(sale);
                                            const margin =
                                                sale.totalValue > 0 ? (profit / sale.totalValue) * 100 : 0;

                                            return (
                                                <>
                                                    <td
                                                        className={`px-4 py-3 font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'
                                                            }`}
                                                    >
                                                        R$ {profit.toFixed(2)}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {margin.toFixed(1)}%
                                                    </td>
                                                </>
                                            );
                                        })()}

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
