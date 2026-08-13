"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Info, Loader2 } from "lucide-react";

import { signInAction, signUpAction } from "@/app/(auth)/actions";
import { initialAuthState, type AuthState } from "@/lib/auth-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : null}
      {pending ? "Just a moment..." : label}
    </Button>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/chat";

  const [state, formAction] = useActionState<AuthState, FormData>(
    isSignup ? signUpAction : signInAction,
    initialAuthState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />

      {isSignup ? (
        <div className="grid gap-2">
          <Label htmlFor="fullName">Name</Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="Aisyah Rahman"
            autoComplete="name"
          />
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          autoComplete="email"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder={isSignup ? "At least 6 characters" : "Your password"}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      {state.notice ? (
        <Alert>
          <Info />
          <AlertDescription>{state.notice}</AlertDescription>
        </Alert>
      ) : null}

      <SubmitButton label={isSignup ? "Create account" : "Sign in"} />

      <p className="text-muted-foreground text-center text-sm">
        {isSignup ? "Already have an account? " : "New to Personify AI? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="text-foreground font-medium underline underline-offset-4"
        >
          {isSignup ? "Sign in" : "Create one free"}
        </Link>
      </p>
    </form>
  );
}
