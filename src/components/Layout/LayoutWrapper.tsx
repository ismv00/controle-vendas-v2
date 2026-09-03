'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface Props {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: Props) {
  const pathname = usePathname();
  const authPages = ['/login', '/register', '/forgot-password'];

  const isAuthPage = authPages.includes(pathname);

  if (isAuthPage) {
    return <main className="min-h-screen bg-appbg">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-appbg">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="mx-auto w-full max-w-[1280px] flex-1 px-8 pb-12 pt-7">{children}</main>
      </div>
    </div>
  );
}
