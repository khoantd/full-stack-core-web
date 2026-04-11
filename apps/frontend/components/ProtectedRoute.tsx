"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredToken } from "@/api/axiosClient";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const token = mounted ? getStoredToken() : null;
  const hasToken = Boolean(token);

  useEffect(() => {
    if (!mounted) return;
    if (!hasToken) {
      const redirectPath = pathname ?? "/";
      router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }
  }, [mounted, hasToken, router, pathname]);

  // Important: keep SSR + first client render identical to avoid hydration mismatch.
  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!hasToken) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
