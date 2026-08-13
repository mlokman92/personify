import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Sign in - Personify AI" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Sign in to keep building your audience personas.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
