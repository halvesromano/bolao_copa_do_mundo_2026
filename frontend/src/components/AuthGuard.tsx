"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const publicRoutes = ["/login", "/cadastro"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const isPublicRoute = publicRoutes.includes(pathname);
      if (!token && !isPublicRoute) {
        router.push("/login");
      } else if (token && isPublicRoute) {
        router.push("/");
      }
    }
  }, [token, pathname, router, mounted]);

  // Evita renderização no servidor para prevenir hydration mismatch do Zustand
  if (!mounted) return null;

  // Se não tem token e a rota é privada, não renderiza nada até redirecionar
  if (!token && !publicRoutes.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
