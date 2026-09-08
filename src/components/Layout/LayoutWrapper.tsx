'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface Props {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  const authPages = ['/login', '/register', '/forgot-password'];
  const isAuthPage = authPages.includes(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileNavOpen(false);
  }

  useEffect(() => {
    if (isAuthPage || loading || user) return;
    router.replace('/login');
  }, [isAuthPage, loading, user, router]);

  if (isAuthPage) {
    return <main className="min-h-screen bg-appbg">{children}</main>;
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-appbg text-[13px] text-mute">
        Carregando...
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-appbg">
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />

        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-12 pt-7 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
