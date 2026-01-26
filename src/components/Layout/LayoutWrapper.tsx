'use client'

import { usePathname } from "next/navigation"
import { Header } from "./Header"
import { NavMenu } from "./NavMenu";

interface Props {
    children: React.ReactNode;
}

export function LayoutWrapper({ children }: Props) {
    const pathname = usePathname()

    const isAuthPage = pathname === '/login';

    return (
        <>
            {!isAuthPage && (
                <>
                    <header className="bg-white border-b border-gray-100">
                        <div className="max-w-7xl mx-auto px-6 py-6">
                            <Header />
                        </div>
                    </header>

                    <nav className="bg-white border-b border-gray-100">
                        <div className="max-w-7xl mx-auto px-6 py-4 justify-center ">
                            <NavMenu />
                        </div>
                    </nav>
                </>
            )}

            <main className="bg-gray-50 min-h-screen mt-8">
                <div className="max-w-7xl mx-auto px-6">
                    {children}
                </div>
            </main>
        </>
    )
}
