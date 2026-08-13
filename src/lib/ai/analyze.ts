import "server-only";

import OpenAI from "openai";

import { openaiApiKey, openaiModel } from "@/lib/env";
import {
  AD_COPY_ANALYSIS_SCHEMA,
  type AdCopyAnalysis,
} from "@/lib/ai/persona-schema";

const SYSTEM_PROMPT = `You are Personify AI, a senior performance-marketing strategist.

You are given an advertisement creative (an "ad copy" image). Your job:
1. Read every piece of text in the image, plus the visual cues (photos, colours,
   logos, language, currency, phone numbers, addresses).
2. Work out what is being sold, by whom, and in which market. If the creative is
   in Malay, Arabic, Chinese or any other language, still answer in English but
   keep brand names and local terms intact.
3. Produce 3 to 5 DISTINCT buyer personas that this creative should be targeted
   at. Distinct means genuinely different people - not the same person described
   twice. Order them best-match first.

Rules for personas:
- Ground everything in what the creative actually shows. Do not invent a product.
- Be specific and operational. "Parents aged 28-45 in Klang Valley who follow
  parenting pages" is useful; "people who like things" is not.
- targetingTags must be terms an advertiser can literally paste into Meta Ads
  Manager, TikTok Ads or Google Ads: interests, behaviours, job titles, life
  events, related brands. 8-14 per persona.
- Infer the market from the creative (language, currency, place names) and make
  location, income level and platform choices fit that market.
- matchScore is your honest 0-100 confidence for that persona.

If the image is not an advertisement, still analyse it as a marketing asset and
say so plainly in the summary.`;

let cachedClient: OpenAI | null = null;

function client(): OpenAI {
  cachedClient ??= new OpenAI({ apiKey: openaiApiKey() });
  return cachedClient;
}

export async function analyzeAdCopy({
  dataUrl,
  note,
}: {
  /** The uploaded image as a base64 data URL. */
  dataUrl: string;
  /** Optional extra instruction the user typed alongside the image. */
  note?: string;
}): Promise<AdCopyAnalysis> {
  const userText = note?.trim()
    ? `Analyse this ad copy and build the target personas.\n\nExtra context from the advertiser: ${note.trim()}`
    : "Analyse this ad copy and build the target personas.";

  const completion = await client().chat.completions.create({
    model: openaiModel(),
    temperature: 0.7,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ad_copy_analysis",
        strict: true,
        schema: AD_COPY_ANALYSIS_SCHEMA as unknown as Record<string, unknown>,
      },
    },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("The model returned an empty response. Please try again.");
  }

  return JSON.parse(raw) as AdCopyAnalysis;
}
