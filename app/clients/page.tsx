import { Suspense } from 'react';
import ClientsPageClient from '@/src/components/Clients/ClientsPageClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Carregando...</p>}>
      <ClientsPageClient />
    </Suspense>
  );
}
