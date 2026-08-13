import Link from "next/link";
import { ArrowRight, ImageUp, Sparkles, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

const FEATURES = [
  {
    icon: ImageUp,
    title: "Upload the creative",
    body: "Poster, flyer, or social ad. The AI reads every word and visual cue.",
  },
  {
    icon: Sparkles,
    title: "Get real personas",
    body: "3-5 distinct buyer personas with age, income, interests and motivations.",
  },
  {
    icon: Target,
    title: "Copy the targeting",
    body: "Paste-ready tags for Meta, TikTok and Google Ads. No guesswork.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <Sparkles className="size-4" />
          </span>
          <span className="tracking-tight">Personify AI</span>
        </span>

        {user ? (
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/chat" />}
          >
            Open app
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              nativeButton={false}
              variant="ghost"
              render={<Link href="/login" />}
            >
              Sign in
            </Button>
            <Button nativeButton={false} render={<Link href="/signup" />}>
              Get started
            </Button>
          </div>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-muted-foreground mb-4 text-sm font-medium">
            Ad copy in. Audience out.
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Upload your ad copy. Get the personas you should be targeting.
          </h1>

          <p className="text-muted-foreground mt-5 text-lg text-pretty">
            Personify AI reads your creative like a media buyer would, then
            hands you the buyer personas and the exact targeting tags to run
            them.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              nativeButton={false}
              size="lg"
              render={<Link href={user ? "/chat" : "/signup"} />}
            >
              {user ? "Open app" : "Start free"}
              <ArrowRight />
            </Button>
            {user ? null : (
              <Button
                nativeButton={false}
                size="lg"
                variant="ghost"
                render={<Link href="/login" />}
              >
                I already have an account
              </Button>
            )}
          </div>

          <p className="text-muted-foreground mt-3 text-xs">
            No credit card. No confirmation email.
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-muted/40 rounded-xl border p-5">
              <Icon className="text-muted-foreground size-5" />
              <p className="mt-3 font-medium">{title}</p>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 py-8">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} Personify AI
        </p>
      </footer>
    </div>
  );
}
