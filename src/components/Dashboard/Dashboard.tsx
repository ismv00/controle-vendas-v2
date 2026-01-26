'use client'

import { useState } from 'react';
import { StatsGrid } from './StatsGrid';

type Period = 'today' | 'month' | 'year' | 'all';

export function Dashboard() {

  const [period, setPeriod] = useState<Period>('month');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* Título */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Visão geral das suas vendas</p>
        </div>

        {/* FILTRO PERIODO */}
        <select className='input w-48' value={period} onChange={(e) => setPeriod(e.target.value as Period)}>

          <option value="today">Hoje</option>
          <option value="month">Este mês</option>
          <option value="year">Este ano</option>
          <option value="all">Tudo</option>

        </select>

      </div>

      {/* Estatísticas */}
      <StatsGrid period={period} />


    </div>
  );
}
