import { StatsGrid } from './StatsGrid';

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral das suas vendas</p>
      </div>

      {/* Estatísticas */}
      <StatsGrid />

      {/* Vendas recentes */}
      <section className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Vendas Recentes</h2>

        <p className="text-sm text-gray-500">Nenhuma venda registrada ainda.</p>

        <p className="text-sm text-gray-500 mt-1">
          Clique em <strong>“Nova Venda”</strong> para começar.
        </p>
      </section>
    </div>
  );
}
