import { Suspense } from 'react';
import ProductsPage from '@/src/components/Products/ProductsPage';

export const dynamic = 'force-dynamic';

export default function Produto() {
  return (
    <Suspense fallback={<p className="text-[13px] text-mute">Carregando...</p>}>
      <ProductsPage />
    </Suspense>
  );
}
