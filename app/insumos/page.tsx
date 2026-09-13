import { Suspense } from 'react';
import InsumosPage from '@/src/components/Insumos/InsumosPage';

export const dynamic = 'force-dynamic';

export default function Insumo() {
  return (
    <Suspense fallback={<p className="text-[13px] text-mute">Carregando...</p>}>
      <InsumosPage />
    </Suspense>
  );
}
