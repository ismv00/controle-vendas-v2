'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ShoppingBag, Package, Users, Tags } from 'lucide-react';

const items = [
  { label: 'Dashboard', href: '/', icon: LayoutGrid },
  { label: 'Clientes', href: '/clients', icon: Users },
  { label: 'Produtos', href: '/produtos', icon: Package },
  { label: 'Tabela de Preços', href: '/price-table', icon: Tags },
  { label: 'Vendas', href: '/vendas', icon: ShoppingBag },
];

export function NavMenu() {
  const pathName = usePathname();

  return (
    <nav className="flex gap-2 bg-gray-100 p-2 rounded-xl shadow-sm border border-gray-200">
      {items.map(({ label, href, icon: Icon }) => {
        const isActive = pathName === href;

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
