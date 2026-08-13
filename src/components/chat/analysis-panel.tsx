"use client";

import { Check, Copy, ScanText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { AdCopyAnalysis } from "@/lib/ai/persona-schema";
import { PersonaCard } from "@/components/chat/persona-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AnalysisPanel({ analysis }: { analysis: AdCopyAnalysis }) {
  const [copied, setCopied] = useState(false);

  async function copyEverything() {
    const text = analysis.personas
      .map(
        (persona, index) =>
          `Persona ${index + 1}: ${persona.name}\n` +
          `- ${persona.tagline}\n` +
          `- Age ${persona.ageRange}, ${persona.gender}, ${persona.maritalStatus}\n` +
          `- ${persona.incomeLevel} | ${persona.location}\n` +
          `- Interests: ${persona.interests.join(", ")}\n` +
          `- Targeting tags: ${persona.targetingTags.join(", ")}\n` +
          `- Platforms: ${persona.platforms.join(", ")}\n` +
          `- Ad angle: ${persona.adAngle}`,
      )
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("All personas copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-muted/40 gap-3">
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <ScanText className="text-muted-foreground size-4 shrink-0" />
            <p className="text-sm font-medium">{analysis.productOrService}</p>
          </div>

          {analysis.keyMessages.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {analysis.keyMessages.map((message) => (
                <Badge key={message} variant="outline" className="font-normal">
                  {message}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">
          {analysis.personas.length} target persona
          {analysis.personas.length === 1 ? "" : "s"}
        </h3>
        <Button variant="outline" size="sm" onClick={copyEverything}>
          {copied ? <Check /> : <Copy />}
          Copy all
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {analysis.personas.map((persona, index) => (
          <PersonaCard
            key={`${persona.name}-${index}`}
            persona={persona}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
