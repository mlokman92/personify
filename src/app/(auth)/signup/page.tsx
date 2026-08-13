import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Create account - Personify AI" };

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">
          No credit card, no confirmation email. Start in seconds.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-72 w-full" />}>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
