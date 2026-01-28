'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { getSalesByUser } from '@/src/services/saleService';
import { Sale } from '@/src/types/Sale';

export function RecentSales() {
    const { user } = useAuth();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        async function fetchRecentSales() {
            setLoading(true);

            const allSales = await getSalesByUser(user!.uid);

            const tenDaysAgo = new Date();
            tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

            const recent = allSales.filter(
                (sale) => sale.createdAt >= tenDaysAgo
            );

            setSales(recent);
            setLoading(false);
        }

        fetchRecentSales();
    }, [user]);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
                Vendas recentes
            </h2>

            <div className="bg-white rounded-xl border overflow-hidden">
                {loading ? (
                    <p className="p-6 text-sm text-gray-500">Carregando vendas...</p>
                ) : sales.length === 0 ? (
                    <p className="p-6 text-sm text-gray-500">
                        Nenhuma venda registrada nos últimos 10 dias.
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
                            {sales.map((sale) => (
                                <tr key={sale.id} className="border-t">
                                    <td className="px-4 py-3">
                                        {sale.createdAt.toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">{sale.clientName}</td>
                                    <td className="px-4 py-3 font-medium">
                                        R$ {sale.totalValue.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-green-600">
                                        R$ {sale.totalProfit.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {sale.totalValue > 0
                                            ? `${(
                                                (sale.totalProfit / sale.totalValue) *
                                                100
                                            ).toFixed(1)}%`
                                            : '0%'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
