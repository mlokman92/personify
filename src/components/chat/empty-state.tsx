import { ImageUp, Sparkles, Target } from "lucide-react";

const STEPS = [
  {
    icon: ImageUp,
    title: "Upload an ad copy",
    body: "Drop in a poster, flyer or social creative. PNG, JPEG, WEBP or GIF.",
  },
  {
    icon: Sparkles,
    title: "AI reads the creative",
    body: "It pulls out the offer, the copy, the visuals and the market.",
  },
  {
    icon: Target,
    title: "Get personas + targeting",
    body: "3-5 buyer personas, each with paste-ready ad targeting tags.",
  },
];

export function EmptyState() {
  return (
    <div className="mx-auto max-w-2xl py-10 text-center">
      <span className="bg-primary text-primary-foreground mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl">
        <Sparkles className="size-6" />
      </span>

      <h1 className="text-2xl font-semibold tracking-tight text-balance">
        Who should see this ad?
      </h1>
      <p className="text-muted-foreground mt-2 text-sm text-pretty">
        Upload your ad copy and Personify AI will tell you exactly who to
        target.
      </p>

      <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="bg-muted/40 rounded-xl border p-4">
            <Icon className="text-muted-foreground size-4" />
            <p className="mt-2.5 text-sm font-medium">{title}</p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              {body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
