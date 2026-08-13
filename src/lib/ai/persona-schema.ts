/**
 * The shape Personify AI asks the model to return for every ad-copy image.
 * Mirrored as a strict JSON schema below so OpenAI Structured Outputs can
 * guarantee the response parses.
 */

export type Persona = {
  /** e.g. "Parent with School-Age Children" */
  name: string;
  /** One line that captures who they are. */
  tagline: string;
  /** e.g. "28-45" */
  ageRange: string;
  /** e.g. "Male and Female", "Mostly female" */
  gender: string;
  /** e.g. "Married with children" */
  maritalStatus: string;
  /** e.g. "Upper middle class" */
  incomeLevel: string;
  /** e.g. "Urban and suburban Klang Valley" */
  location: string;
  occupations: string[];
  interests: string[];
  behaviours: string[];
  painPoints: string[];
  motivations: string[];
  /** Ready-to-paste ad-platform targeting terms. */
  targetingTags: string[];
  /** e.g. ["Meta Ads", "TikTok Ads", "Google Search"] */
  platforms: string[];
  /** The angle/hook to lead with for this persona. */
  adAngle: string;
  /** 0-100 confidence that this persona fits the ad copy. */
  matchScore: number;
};

export type AdCopyAnalysis = {
  /** Short conversation title, e.g. "Bright Minds Tuition Centre". */
  title: string;
  /** What the image is advertising. */
  productOrService: string;
  /** Everything the model could read off the creative. */
  extractedText: string;
  /** A short paragraph summarising the creative for the chat bubble. */
  summary: string;
  /** The main selling points detected in the copy. */
  keyMessages: string[];
  personas: Persona[];
};

const stringArray = (description: string) => ({
  type: "array",
  description,
  items: { type: "string" },
});

const personaSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: {
      type: "string",
      description: 'Short persona label, e.g. "Parent with Children".',
    },
    tagline: { type: "string", description: "One-line description." },
    ageRange: { type: "string", description: 'Age range, e.g. "28-45".' },
    gender: {
      type: "string",
      description: 'e.g. "Male and Female" or "Mostly female".',
    },
    maritalStatus: {
      type: "string",
      description: 'e.g. "Married", "Single", "Married with children".',
    },
    incomeLevel: {
      type: "string",
      description: 'e.g. "Middle to upper middle class".',
    },
    location: {
      type: "string",
      description: "Where they live / where to geo-target.",
    },
    occupations: stringArray("Typical jobs or life roles."),
    interests: stringArray("Interests usable as ad interest targeting."),
    behaviours: stringArray("Buying and online behaviours."),
    painPoints: stringArray("Problems this persona wants solved."),
    motivations: stringArray("What pushes them to act."),
    targetingTags: stringArray(
      "8-14 concrete targeting keywords an advertiser can paste into an ad manager.",
    ),
    platforms: stringArray("Best ad platforms/placements for this persona."),
    adAngle: {
      type: "string",
      description: "The hook or angle to lead with for this persona.",
    },
    matchScore: {
      type: "number",
      description: "0-100 confidence this persona fits the ad copy.",
    },
  },
  required: [
    "name",
    "tagline",
    "ageRange",
    "gender",
    "maritalStatus",
    "incomeLevel",
    "location",
    "occupations",
    "interests",
    "behaviours",
    "painPoints",
    "motivations",
    "targetingTags",
    "platforms",
    "adAngle",
    "matchScore",
  ],
} as const;

export const AD_COPY_ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: {
      type: "string",
      description: "Max 6 words. Used as the chat thread title.",
    },
    productOrService: {
      type: "string",
      description: "What is being advertised.",
    },
    extractedText: {
      type: "string",
      description: "All readable text from the creative.",
    },
    summary: {
      type: "string",
      description:
        "2-4 sentences summarising the creative and who it should target.",
    },
    keyMessages: stringArray("The main selling points in the copy."),
    personas: {
      type: "array",
      description: "3-5 distinct target personas, best match first.",
      items: personaSchema,
    },
  },
  required: [
    "title",
    "productOrService",
    "extractedText",
    "summary",
    "keyMessages",
    "personas",
  ],
} as const;

const list = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];

const text = (value: unknown): string =>
  typeof value === "string" ? value : "";

/**
 * `analysis` is jsonb written from a model response. Structured Outputs makes a
 * complete object the norm, but one malformed row should degrade a single card
 * rather than throw and take down the whole thread route.
 */
export function normalizeAnalysis(raw: unknown): AdCopyAnalysis | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;

  const personas = (Array.isArray(value.personas) ? value.personas : [])
    .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
    .map((p) => ({
      name: text(p.name) || "Untitled persona",
      tagline: text(p.tagline),
      ageRange: text(p.ageRange),
      gender: text(p.gender),
      maritalStatus: text(p.maritalStatus),
      incomeLevel: text(p.incomeLevel),
      location: text(p.location),
      occupations: list(p.occupations),
      interests: list(p.interests),
      behaviours: list(p.behaviours),
      painPoints: list(p.painPoints),
      motivations: list(p.motivations),
      targetingTags: list(p.targetingTags),
      platforms: list(p.platforms),
      adAngle: text(p.adAngle),
      matchScore: typeof p.matchScore === "number" ? p.matchScore : 0,
    }));

  if (personas.length === 0) return null;

  return {
    title: text(value.title),
    productOrService: text(value.productOrService),
    extractedText: text(value.extractedText),
    summary: text(value.summary),
    keyMessages: list(value.keyMessages),
    personas,
  };
}
