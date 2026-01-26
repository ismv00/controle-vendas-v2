'use client'

import { useEffect } from "react"
import { useAuth } from "@/src/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
    } else {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  return null;
}
