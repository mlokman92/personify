"use client";

import { useState } from "react";
import { Check, Copy, Crosshair, Megaphone } from "lucide-react";
import { toast } from "sonner";

import type { Persona } from "@/lib/ai/persona-schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function TagRow({
  label,
  values,
  variant = "secondary",
}: {
  label: string;
  values: string[];
  variant?: "secondary" | "outline";
}) {
  if (values.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <Badge key={value} variant={variant} className="font-normal">
            {value}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="truncate text-sm font-medium" title={value}>
        {value}
      </dd>
    </div>
  );
}

export function PersonaCard({
  persona,
  index,
}: {
  persona: Persona;
  index: number;
}) {
  const [copied, setCopied] = useState(false);

  async function copyTags() {
    try {
      await navigator.clipboard.writeText(persona.targetingTags.join(", "));
      setCopied(true);
      toast.success(`Copied ${persona.targetingTags.length} targeting tags`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  const score = Math.max(0, Math.min(100, Math.round(persona.matchScore)));

  return (
    <Card className="gap-4 overflow-hidden">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="bg-primary text-primary-foreground mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums">
              {index + 1}
            </span>
            <div className="min-w-0">
              <CardTitle className="text-base leading-tight">
                {persona.name}
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                {persona.tagline}
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="shrink-0 tabular-nums">
            {score}% match
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          <Detail label="Age" value={persona.ageRange} />
          <Detail label="Gender" value={persona.gender} />
          <Detail label="Status" value={persona.maritalStatus} />
          <Detail label="Income" value={persona.incomeLevel} />
          <Detail label="Location" value={persona.location} />
          <Detail label="Works as" value={persona.occupations.join(", ")} />
        </dl>

        <Separator />

        <div className="space-y-3.5">
          <TagRow label="Interests" values={persona.interests} />
          <TagRow label="Behaviours" values={persona.behaviours} />
          <TagRow
            label="Pain points"
            values={persona.painPoints}
            variant="outline"
          />
          <TagRow
            label="Motivations"
            values={persona.motivations}
            variant="outline"
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
              <Crosshair className="size-3.5" />
              Targeting tags
            </p>
            <Button variant="ghost" size="xs" onClick={copyTags}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {persona.targetingTags.map((tag) => (
              <Badge key={tag} className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {persona.platforms.length > 0 ? (
          <TagRow
            label="Run it on"
            values={persona.platforms}
            variant="outline"
          />
        ) : null}

        {persona.adAngle ? (
          <div className="bg-muted/50 rounded-lg border p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
              <Megaphone className="size-3.5" />
              Ad angle
            </p>
            <p className="mt-1.5 text-sm">{persona.adAngle}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
