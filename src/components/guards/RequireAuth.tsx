"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RequireAuth({ children, admin }: { children: React.ReactNode; admin?: boolean }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && admin && user && !user.isAdmin) router.replace("/dashboard");
  }, [user, loading, admin, router]);
  if (loading || !user || (admin && !user.isAdmin)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink-500">
        <Spinner className="mr-3" /> Checking access&hellip;
      </div>
    );
  }
  return <>{children}</>;
}
