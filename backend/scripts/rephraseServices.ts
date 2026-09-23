/**
 * Script: Rephrase Content of Active Services (Live / Local)
 *
 * Fetches all published services from the database and rephrases the narrative
 * content (paragraphs, subtitles, bullet points, answers, descriptions) using
 * Google Gemini API, while strictly preserving:
 *   - Service titles and slugs
 *   - Section titles, block headings, and FAQ questions
 *   - Step numbers, patient data, images, icons, and pricing tables
 *
 * Usage:
 *   # Dry-run on local database (previews changes without writing to DB):
 *   npm run services:rephrase -- --dry-run
 *
 *   # Rephrase a single service on live RDS database to test:
 *   npm run services:rephrase -- --prod --slug=temple-hair-transplant --dry-run
 *
 *   # Rephrase all active services on live RDS database:
 *   npm run services:rephrase -- --prod
 *
 *   # Backup all services to JSON:
 *   npm run services:backup -- --prod
 *
 *   # Restore services from a backup file:
 *   npm run services:restore -- --prod --restore=scripts/backups/services_backup_xxx.json
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// ── 1. Parse Command Line Arguments ──────────────────────────────────────────
const args = process.argv.slice(2);

function getArgValue(prefix: string): string | null {
  const match = args.find((a) => a.startsWith(`${prefix}=`));
  return match ? match.slice(prefix.length + 1).trim() : null;
}

const isProd = args.includes("--prod") || args.includes("--production");
const isDryRun = args.includes("--dry-run");
const isBackupOnly = args.includes("--backup-only");
const restoreFile = getArgValue("--restore");
const targetSlug = getArgValue("--slug");
const limitArg = getArgValue("--limit");
const limit = limitArg ? parseInt(limitArg, 10) : undefined;
const customProvider = getArgValue("--provider"); // 'openai' | 'gemini'

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Anwar Clinic / NexGen - Service Content Rephraser

Usage:
  npm run services:rephrase [options]

Options:
  --provider=<openai|gemini> AI Provider (default: auto-detected based on API key)
  --model=<modelName>        Model name (default: gpt-4o-mini for OpenAI, gemini-2.5-flash for Gemini)
  --api-key=<key>            API Key (or set OPENAI_API_KEY or GEMINI_API_KEY in .env)
  --prod, --production       Use .env.production (RDS live database)
  --env=<path>               Specify custom .env file path
  --dry-run                  Preview rephrased content without updating database
  --slug=<slug>              Rephrase only a specific service (e.g. --slug=fut-hair-transplant)
  --limit=<n>                Limit to the first N active services
  --backup-only              Create a timestamped JSON backup of all services and exit
  --restore=<path>           Restore service contents from a JSON backup file
  --help, -h                 Show this help message
`);
  process.exit(0);
}

// Determine which .env file to load
const customEnv = getArgValue("--env");
const envFileName = customEnv || (isProd ? ".env.production" : ".env");
const envFilePath = path.resolve(__dirname, "..", envFileName);

if (fs.existsSync(envFilePath)) {
  dotenv.config({ path: envFilePath, override: true });
  console.log(`Loaded environment from: ${envFileName}`);
} else {
  dotenv.config();
  console.log(`Using default environment variables`);
}

// Determine provider and keys
const openaiKey = process.env.OPENAI_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const cliApiKey = getArgValue("--api-key");

let provider = customProvider ? customProvider.toLowerCase() : "";
if (!provider) {
  if (cliApiKey?.startsWith("sk-") || openaiKey) {
    provider = "openai";
  } else if (geminiKey) {
    provider = "gemini";
  } else {
    // Default fallback to openai if neither is explicitly found
    provider = "openai";
  }
}

const apiKey =
  cliApiKey || (provider === "openai" ? openaiKey : geminiKey);

const defaultModel = provider === "openai" ? "gpt-4o-mini" : "gemini-2.5-flash";
const modelName = getArgValue("--model") || defaultModel;

// ── 2. Helper: Sleep / Rate Limit Delay ───────────────────────────────────────
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ── 3. AI API Clients ────────────────────────────────────────────────────────

async function callOpenAI(prompt: string, key: string, model: string): Promise<string> {
  const url = "https://api.openai.com/v1/chat/completions";

  const payload = {
    model: model || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an elite medical copywriter and clinical communications expert. You must respond strictly in valid JSON adhering exactly to the requested schema.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.65,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errorText}`);
  }

  const json: any = await res.json();
  const candidateText = json.choices?.[0]?.message?.content;
  if (!candidateText) {
    throw new Error("No text candidate returned by OpenAI API");
  }
  return candidateText;
}

async function callGemini(prompt: string, key: string, model: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.65,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    // If 2.5 is unavailable or quota error, retry with gemini-1.5-flash
    if (model !== "gemini-1.5-flash" && (res.status === 404 || res.status === 400)) {
      console.warn(`[Gemini] ${model} returned ${res.status}. Falling back to gemini-1.5-flash...`);
      return callGemini(prompt, key, "gemini-1.5-flash");
    }
    throw new Error(`Gemini API error (${res.status}): ${errorText}`);
  }

  const json: any = await res.json();
  const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new Error("No text candidate returned by Gemini API");
  }
  return candidateText;
}

async function callAI(prompt: string, key: string, prov: string, model: string): Promise<string> {
  if (prov === "openai") {
    return callOpenAI(prompt, key, model);
  }
  return callGemini(prompt, key, model);
}


// ── 4. Content Extraction and Merging ─────────────────────────────────────────

interface ExtractedContent {
  cardDescription?: string;
  seoDescription?: string;
  sections: {
    hero?: { subtitle?: string; tagline?: string };
    intro?: {
      block1Lead?: string;
      block1Paragraphs?: string[];
      block2Paragraphs?: string[];
    };
    candidate?: {
      subtitle?: string;
      points?: { title: string; desc: string }[];
    };
    types?: {
      subtitle?: string;
      types?: { title: string; desc: string; points?: string[] }[];
    };
    benefits?: {
      subtitle?: string;
      benefits?: { title: string; desc: string }[];
    };
    procedure?: {
      subtitle?: string;
      steps?: { title: string; desc: string }[];
    };
    preProcedure?: {
      subtitle?: string;
      tips?: { title: string; desc: string }[];
    };
    cost?: {
      costOverview?: string[];
      factorsSubtitle?: string;
      factors?: { title: string; desc: string }[];
    };
    whyUs?: {
      subtitle?: string;
      stats?: { title: string; desc: string }[];
    };
    causes?: {
      subtitle?: string;
      causes?: { title: string; desc: string }[];
    };
    whyChooseNexGen?: {
      subtitle?: string;
      features?: { title: string; desc: string }[];
    };
    postSurgerySupport?: {
      subtitle?: string;
      supportItems?: { title: string; desc: string }[];
    };
    dosDonts?: {
      subtitle?: string;
      dos?: string[];
      donts?: string[];
    };
    recoveryTimeline?: {
      subtitle?: string;
      weeks?: { label: string; expectations?: string[]; careGuidelines?: string[] }[];
    };
    comparison?: {
      subtitle?: string;
      cards?: { title: string; purpose: string }[];
    };
    faq?: {
      faqs?: { question: string; answer: string }[];
    };
  };
}

function extractEditableContent(service: any): ExtractedContent {
  const sections = service.sections || {};
  const extracted: ExtractedContent = {
    cardDescription: service.cardDescription || undefined,
    seoDescription: service.seoDescription || undefined,
    sections: {},
  };

  // Hero
  if (sections.hero) {
    extracted.sections.hero = {};
    if (sections.hero.subtitle) extracted.sections.hero.subtitle = sections.hero.subtitle;
    if (sections.hero.tagline) extracted.sections.hero.tagline = sections.hero.tagline;
  }

  // Intro
  if (sections.intro) {
    extracted.sections.intro = {};
    if (sections.intro.block1Lead) extracted.sections.intro.block1Lead = sections.intro.block1Lead;
    if (Array.isArray(sections.intro.block1Paragraphs) && sections.intro.block1Paragraphs.length) {
      extracted.sections.intro.block1Paragraphs = sections.intro.block1Paragraphs;
    }
    if (Array.isArray(sections.intro.block2Paragraphs) && sections.intro.block2Paragraphs.length) {
      extracted.sections.intro.block2Paragraphs = sections.intro.block2Paragraphs;
    }
  }

  // Candidate
  if (sections.candidate) {
    extracted.sections.candidate = {};
    if (sections.candidate.subtitle) extracted.sections.candidate.subtitle = sections.candidate.subtitle;
    if (Array.isArray(sections.candidate.points)) {
      extracted.sections.candidate.points = sections.candidate.points.map((p: any) => ({
        title: p.title || "",
        desc: p.desc || "",
      }));
    }
  }

  // Types
  if (sections.types) {
    extracted.sections.types = {};
    if (sections.types.subtitle) extracted.sections.types.subtitle = sections.types.subtitle;
    if (Array.isArray(sections.types.types)) {
      extracted.sections.types.types = sections.types.types.map((t: any) => ({
        title: t.title || "",
        desc: t.desc || "",
        points: Array.isArray(t.points) ? t.points : [],
      }));
    }
  }

  // Benefits
  if (sections.benefits) {
    extracted.sections.benefits = {};
    if (sections.benefits.subtitle) extracted.sections.benefits.subtitle = sections.benefits.subtitle;
    if (Array.isArray(sections.benefits.benefits)) {
      extracted.sections.benefits.benefits = sections.benefits.benefits.map((b: any) => ({
        title: b.title || "",
        desc: b.desc || "",
      }));
    }
  }

  // Procedure
  if (sections.procedure) {
    extracted.sections.procedure = {};
    if (sections.procedure.subtitle) extracted.sections.procedure.subtitle = sections.procedure.subtitle;
    if (Array.isArray(sections.procedure.steps)) {
      extracted.sections.procedure.steps = sections.procedure.steps.map((s: any) => ({
        title: s.title || "",
        desc: s.desc || "",
      }));
    }
  }

  // PreProcedure
  if (sections.preProcedure) {
    extracted.sections.preProcedure = {};
    if (sections.preProcedure.subtitle) extracted.sections.preProcedure.subtitle = sections.preProcedure.subtitle;
    if (Array.isArray(sections.preProcedure.tips)) {
      extracted.sections.preProcedure.tips = sections.preProcedure.tips.map((t: any) => ({
        title: t.title || "",
        desc: t.desc || "",
      }));
    }
  }

  // Cost
  if (sections.cost) {
    extracted.sections.cost = {};
    if (Array.isArray(sections.cost.costOverview) && sections.cost.costOverview.length) {
      extracted.sections.cost.costOverview = sections.cost.costOverview;
    }
    if (sections.cost.factorsSubtitle) extracted.sections.cost.factorsSubtitle = sections.cost.factorsSubtitle;
    if (Array.isArray(sections.cost.factors)) {
      extracted.sections.cost.factors = sections.cost.factors.map((f: any) => ({
        title: f.title || "",
        desc: f.desc || "",
      }));
    }
  }

  // Why Us
  if (sections.whyUs) {
    extracted.sections.whyUs = {};
    if (sections.whyUs.subtitle) extracted.sections.whyUs.subtitle = sections.whyUs.subtitle;
    if (Array.isArray(sections.whyUs.stats)) {
      extracted.sections.whyUs.stats = sections.whyUs.stats.map((s: any) => ({
        title: s.title || "",
        desc: s.desc || "",
      }));
    }
  }

  // Causes
  if (sections.causes) {
    extracted.sections.causes = {};
    if (sections.causes.subtitle) extracted.sections.causes.subtitle = sections.causes.subtitle;
    if (Array.isArray(sections.causes.causes)) {
      extracted.sections.causes.causes = sections.causes.causes.map((c: any) => ({
        title: c.title || "",
        desc: c.desc || "",
      }));
    }
  }

  // Why Choose NexGen
  if (sections.whyChooseNexGen) {
    extracted.sections.whyChooseNexGen = {};
    if (sections.whyChooseNexGen.subtitle) extracted.sections.whyChooseNexGen.subtitle = sections.whyChooseNexGen.subtitle;
    if (Array.isArray(sections.whyChooseNexGen.features)) {
      extracted.sections.whyChooseNexGen.features = sections.whyChooseNexGen.features.map((f: any) => ({
        title: f.title || "",
        desc: f.desc || "",
      }));
    }
  }

  // Post Surgery Support
  if (sections.postSurgerySupport) {
    extracted.sections.postSurgerySupport = {};
    if (sections.postSurgerySupport.subtitle) extracted.sections.postSurgerySupport.subtitle = sections.postSurgerySupport.subtitle;
    if (Array.isArray(sections.postSurgerySupport.supportItems)) {
      extracted.sections.postSurgerySupport.supportItems = sections.postSurgerySupport.supportItems.map((s: any) => ({
        title: s.title || "",
        desc: s.desc || "",
      }));
    }
  }

  // Dos and Don'ts
  if (sections.dosDonts) {
    extracted.sections.dosDonts = {};
    if (sections.dosDonts.subtitle) extracted.sections.dosDonts.subtitle = sections.dosDonts.subtitle;
    if (Array.isArray(sections.dosDonts.dos)) extracted.sections.dosDonts.dos = sections.dosDonts.dos;
    if (Array.isArray(sections.dosDonts.donts)) extracted.sections.dosDonts.donts = sections.dosDonts.donts;
  }

  // Recovery Timeline
  if (sections.recoveryTimeline) {
    extracted.sections.recoveryTimeline = {};
    if (sections.recoveryTimeline.subtitle) extracted.sections.recoveryTimeline.subtitle = sections.recoveryTimeline.subtitle;
    if (Array.isArray(sections.recoveryTimeline.weeks)) {
      extracted.sections.recoveryTimeline.weeks = sections.recoveryTimeline.weeks.map((w: any) => ({
        label: w.label || "",
        expectations: Array.isArray(w.expectations) ? w.expectations : [],
        careGuidelines: Array.isArray(w.careGuidelines) ? w.careGuidelines : [],
      }));
    }
  }

  // Comparison
  if (sections.comparison) {
    extracted.sections.comparison = {};
    if (sections.comparison.subtitle) extracted.sections.comparison.subtitle = sections.comparison.subtitle;
    if (Array.isArray(sections.comparison.cards)) {
      extracted.sections.comparison.cards = sections.comparison.cards.map((c: any) => ({
        title: c.title || "",
        purpose: c.purpose || "",
      }));
    }
  }

  // FAQ
  if (sections.faq) {
    extracted.sections.faq = {};
    if (Array.isArray(sections.faq.faqs)) {
      extracted.sections.faq.faqs = sections.faq.faqs.map((f: any) => ({
        question: f.question || "",
        answer: f.answer || "",
      }));
    }
  }

  return extracted;
}

/**
 * Merge the rephrased content back into the original service record,
 * ensuring all original titles, images, and non-rephrased fields remain intact.
 */
function mergeRephrasedContent(originalSections: any, rephrased: ExtractedContent): any {
  const updatedSections = JSON.parse(JSON.stringify(originalSections || {}));
  const rSec = rephrased.sections || {};

  // Hero
  if (rSec.hero && updatedSections.hero) {
    if (rSec.hero.subtitle) updatedSections.hero.subtitle = rSec.hero.subtitle;
    if (rSec.hero.tagline) updatedSections.hero.tagline = rSec.hero.tagline;
  }

  // Intro
  if (rSec.intro && updatedSections.intro) {
    if (rSec.intro.block1Lead) updatedSections.intro.block1Lead = rSec.intro.block1Lead;
    if (rSec.intro.block1Paragraphs?.length) updatedSections.intro.block1Paragraphs = rSec.intro.block1Paragraphs;
    if (rSec.intro.block2Paragraphs?.length) updatedSections.intro.block2Paragraphs = rSec.intro.block2Paragraphs;
  }

  // Candidate
  if (rSec.candidate && updatedSections.candidate) {
    if (rSec.candidate.subtitle) updatedSections.candidate.subtitle = rSec.candidate.subtitle;
    if (Array.isArray(rSec.candidate.points) && Array.isArray(updatedSections.candidate.points)) {
      updatedSections.candidate.points = updatedSections.candidate.points.map((p: any, i: number) => {
        const rp = rSec.candidate?.points?.[i];
        return rp?.desc ? { ...p, desc: rp.desc } : p;
      });
    }
  }

  // Types
  if (rSec.types && updatedSections.types) {
    if (rSec.types.subtitle) updatedSections.types.subtitle = rSec.types.subtitle;
    if (Array.isArray(rSec.types.types) && Array.isArray(updatedSections.types.types)) {
      updatedSections.types.types = updatedSections.types.types.map((t: any, i: number) => {
        const rt = rSec.types?.types?.[i];
        return {
          ...t,
          desc: rt?.desc || t.desc,
          points: Array.isArray(rt?.points) && rt.points.length ? rt.points : t.points,
        };
      });
    }
  }

  // Benefits
  if (rSec.benefits && updatedSections.benefits) {
    if (rSec.benefits.subtitle) updatedSections.benefits.subtitle = rSec.benefits.subtitle;
    if (Array.isArray(rSec.benefits.benefits) && Array.isArray(updatedSections.benefits.benefits)) {
      updatedSections.benefits.benefits = updatedSections.benefits.benefits.map((b: any, i: number) => {
        const rb = rSec.benefits?.benefits?.[i];
        return rb?.desc ? { ...b, desc: rb.desc } : b;
      });
    }
  }

  // Procedure
  if (rSec.procedure && updatedSections.procedure) {
    if (rSec.procedure.subtitle) updatedSections.procedure.subtitle = rSec.procedure.subtitle;
    if (Array.isArray(rSec.procedure.steps) && Array.isArray(updatedSections.procedure.steps)) {
      updatedSections.procedure.steps = updatedSections.procedure.steps.map((s: any, i: number) => {
        const rs = rSec.procedure?.steps?.[i];
        return rs?.desc ? { ...s, desc: rs.desc } : s;
      });
    }
  }

  // PreProcedure
  if (rSec.preProcedure && updatedSections.preProcedure) {
    if (rSec.preProcedure.subtitle) updatedSections.preProcedure.subtitle = rSec.preProcedure.subtitle;
    if (Array.isArray(rSec.preProcedure.tips) && Array.isArray(updatedSections.preProcedure.tips)) {
      updatedSections.preProcedure.tips = updatedSections.preProcedure.tips.map((t: any, i: number) => {
        const rt = rSec.preProcedure?.tips?.[i];
        return rt?.desc ? { ...t, desc: rt.desc } : t;
      });
    }
  }

  // Cost
  if (rSec.cost && updatedSections.cost) {
    if (rSec.cost.costOverview?.length) updatedSections.cost.costOverview = rSec.cost.costOverview;
    if (rSec.cost.factorsSubtitle) updatedSections.cost.factorsSubtitle = rSec.cost.factorsSubtitle;
    if (Array.isArray(rSec.cost.factors) && Array.isArray(updatedSections.cost.factors)) {
      updatedSections.cost.factors = updatedSections.cost.factors.map((f: any, i: number) => {
        const rf = rSec.cost?.factors?.[i];
        return rf?.desc ? { ...f, desc: rf.desc } : f;
      });
    }
  }

  // Why Us
  if (rSec.whyUs && updatedSections.whyUs) {
    if (rSec.whyUs.subtitle) updatedSections.whyUs.subtitle = rSec.whyUs.subtitle;
    if (Array.isArray(rSec.whyUs.stats) && Array.isArray(updatedSections.whyUs.stats)) {
      updatedSections.whyUs.stats = updatedSections.whyUs.stats.map((s: any, i: number) => {
        const rs = rSec.whyUs?.stats?.[i];
        return rs?.desc ? { ...s, desc: rs.desc } : s;
      });
    }
  }

  // Causes
  if (rSec.causes && updatedSections.causes) {
    if (rSec.causes.subtitle) updatedSections.causes.subtitle = rSec.causes.subtitle;
    if (Array.isArray(rSec.causes.causes) && Array.isArray(updatedSections.causes.causes)) {
      updatedSections.causes.causes = updatedSections.causes.causes.map((c: any, i: number) => {
        const rc = rSec.causes?.causes?.[i];
        return rc?.desc ? { ...c, desc: rc.desc } : c;
      });
    }
  }

  // Why Choose NexGen
  if (rSec.whyChooseNexGen && updatedSections.whyChooseNexGen) {
    if (rSec.whyChooseNexGen.subtitle) updatedSections.whyChooseNexGen.subtitle = rSec.whyChooseNexGen.subtitle;
    if (Array.isArray(rSec.whyChooseNexGen.features) && Array.isArray(updatedSections.whyChooseNexGen.features)) {
      updatedSections.whyChooseNexGen.features = updatedSections.whyChooseNexGen.features.map((f: any, i: number) => {
        const rf = rSec.whyChooseNexGen?.features?.[i];
        return rf?.desc ? { ...f, desc: rf.desc } : f;
      });
    }
  }

  // Post Surgery Support
  if (rSec.postSurgerySupport && updatedSections.postSurgerySupport) {
    if (rSec.postSurgerySupport.subtitle) updatedSections.postSurgerySupport.subtitle = rSec.postSurgerySupport.subtitle;
    if (Array.isArray(rSec.postSurgerySupport.supportItems) && Array.isArray(updatedSections.postSurgerySupport.supportItems)) {
      updatedSections.postSurgerySupport.supportItems = updatedSections.postSurgerySupport.supportItems.map((s: any, i: number) => {
        const rs = rSec.postSurgerySupport?.supportItems?.[i];
        return rs?.desc ? { ...s, desc: rs.desc } : s;
      });
    }
  }

  // Dos and Don'ts
  if (rSec.dosDonts && updatedSections.dosDonts) {
    if (rSec.dosDonts.subtitle) updatedSections.dosDonts.subtitle = rSec.dosDonts.subtitle;
    if (rSec.dosDonts.dos?.length) updatedSections.dosDonts.dos = rSec.dosDonts.dos;
    if (rSec.dosDonts.donts?.length) updatedSections.dosDonts.donts = rSec.dosDonts.donts;
  }

  // Recovery Timeline
  if (rSec.recoveryTimeline && updatedSections.recoveryTimeline) {
    if (rSec.recoveryTimeline.subtitle) updatedSections.recoveryTimeline.subtitle = rSec.recoveryTimeline.subtitle;
    if (Array.isArray(rSec.recoveryTimeline.weeks) && Array.isArray(updatedSections.recoveryTimeline.weeks)) {
      updatedSections.recoveryTimeline.weeks = updatedSections.recoveryTimeline.weeks.map((w: any, i: number) => {
        const rw = rSec.recoveryTimeline?.weeks?.[i];
        return {
          ...w,
          expectations: rw?.expectations?.length ? rw.expectations : w.expectations,
          careGuidelines: rw?.careGuidelines?.length ? rw.careGuidelines : w.careGuidelines,
        };
      });
    }
  }

  // Comparison
  if (rSec.comparison && updatedSections.comparison) {
    if (rSec.comparison.subtitle) updatedSections.comparison.subtitle = rSec.comparison.subtitle;
    if (Array.isArray(rSec.comparison.cards) && Array.isArray(updatedSections.comparison.cards)) {
      updatedSections.comparison.cards = updatedSections.comparison.cards.map((c: any, i: number) => {
        const rc = rSec.comparison?.cards?.[i];
        return rc?.purpose ? { ...c, purpose: rc.purpose } : c;
      });
    }
  }

  // FAQ
  if (rSec.faq && updatedSections.faq) {
    if (Array.isArray(rSec.faq.faqs) && Array.isArray(updatedSections.faq.faqs)) {
      updatedSections.faq.faqs = updatedSections.faq.faqs.map((f: any, i: number) => {
        const rf = rSec.faq?.faqs?.[i];
        return rf?.answer ? { ...f, answer: rf.answer } : f;
      });
    }
  }

  return updatedSections;
}

// ── 5. Main Execution Flow ───────────────────────────────────────────────────

async function main() {
  console.log("=================================================================");
  console.log("   Anwar Clinic / NexGen - Service Content Rephrasing Script     ");
  console.log("=================================================================");
  console.log(`Provider:   ${provider.toUpperCase()} (Model: ${modelName})`);
  console.log(`Mode:       ${isDryRun ? "DRY-RUN (No DB updates)" : "LIVE WRITE"}`);
  console.log(`Target DB:  ${isProd ? "PRODUCTION (RDS)" : "LOCAL / DEV"}`);
  if (targetSlug) console.log(`Filter:     Slug = "${targetSlug}"`);
  if (limit) console.log(`Limit:      First ${limit} service(s)`);
  console.log("=================================================================\n");

  // Dynamically import database and Service model to ensure env variables are loaded
  const { sequelize } = await import("../src/config/database");
  const { Service } = await import("../src/models/Service");

  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.\n");
  } catch (err: any) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }

  // ── Handle Restore Mode ────────────────────────────────────────────────────
  if (restoreFile) {
    console.log(`Starting restore from backup: ${restoreFile}`);
    if (!fs.existsSync(restoreFile)) {
      console.error(`Error: Backup file not found at: ${restoreFile}`);
      process.exit(1);
    }

    const backupData = JSON.parse(fs.readFileSync(restoreFile, "utf-8"));
    if (!Array.isArray(backupData)) {
      console.error("Error: Invalid backup format. Expected an array of services.");
      process.exit(1);
    }

    let restoredCount = 0;
    for (const item of backupData) {
      const service = await Service.findByPk(item.id);
      if (service) {
        await service.update({
          cardDescription: item.cardDescription,
          seoDescription: item.seoDescription,
          sections: item.sections,
        });
        restoredCount++;
        console.log(`Restored service: ${item.title} (${item.slug})`);
      }
    }

    console.log(`\nRestore complete: ${restoredCount} services restored.`);
    await sequelize.close();
    return;
  }

  // ── Fetch Services ─────────────────────────────────────────────────────────
  const whereClause: any = { status: "published" };
  if (targetSlug) {
    whereClause.slug = targetSlug;
  }

  const services = await Service.findAll({
    where: whereClause,
    order: [["sortOrder", "ASC"], ["createdAt", "ASC"]],
    limit,
  });

  if (!services.length) {
    console.log("No active (published) services found matching the criteria.");
    await sequelize.close();
    return;
  }

  console.log(`Found ${services.length} active service(s) to process.\n`);

  // ── Create Automatic Timestamped Backup ─────────────────────────────────────
  const backupDir = path.resolve(__dirname, "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFilePath = path.join(backupDir, `services_backup_${timestamp}.json`);
  const fullBackupPayload = services.map((s) => s.toJSON());

  fs.writeFileSync(backupFilePath, JSON.stringify(fullBackupPayload, null, 2), "utf-8");
  console.log(`Saved backup of all ${services.length} service(s) to:\n  ${backupFilePath}\n`);

  if (isBackupOnly) {
    console.log("Backup complete (--backup-only). Exiting without changes.");
    await sequelize.close();
    return;
  }

  // ── Check API Key ──────────────────────────────────────────────────────────
  if (!apiKey) {
    const keyName = provider === "openai" ? "OPENAI_API_KEY" : "GEMINI_API_KEY";
    console.error(`ERROR: ${keyName} is not set.`);
    console.error(`Please add ${keyName} to your .env file or pass it via: --api-key=YOUR_KEY`);
    process.exit(1);
  }

  // ── Process Each Service ───────────────────────────────────────────────────
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    const progress = `[${i + 1}/${services.length}]`;
    console.log(`${progress} Processing: "${service.title}" (slug: ${service.slug})...`);

    const extracted = extractEditableContent(service);

    // Build the AI prompt
    const prompt = `You are an elite medical copywriter and clinical communications expert for Anwar Clinic / NexGen Hair Transplant Clinic.

We need you to rewrite and rephrase the narrative content for our service page titled: "${service.title}".

CRITICAL INSTRUCTIONS:
1. ONLY rephrase the narrative descriptions, subtitles, bullet points, paragraph texts, and FAQ answers.
2. DO NOT change ANY titles, headings, procedure names, questions, patient names, graft counts, or price numbers.
3. If an object has a 'title' or 'question', keep that exact 'title' or 'question' intact and ONLY rewrite the 'desc' or 'answer'.
4. Tone & Style:
   - High patient engagement, compassionate, professional medical elegance.
   - Retain 100% clinical and scientific accuracy (e.g. hair follicle viability, micro-grafting, natural angulation, healing timeline).
   - Clear, punchy, persuasive English, free of generic clichés or repetitive phrasing.
5. Bullet points & paragraph arrays:
   - Keep the exact same number of items as the input array.
   - Rephrase each item into engaging, impactful language.
6. Return your output as STRICT JSON adhering EXACTLY to this schema:
${JSON.stringify(extracted, null, 2)}

Only return valid JSON. Do not include markdown code block formatting or explanations.`;

    try {
      console.log(`   -> Calling ${provider.toUpperCase()} (${modelName})...`);
      const rawResponse = await callAI(prompt, apiKey, provider, modelName);

      // Clean potential markdown ticks if returned
      const cleanJsonText = rawResponse.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
      const rephrased: ExtractedContent = JSON.parse(cleanJsonText);

      // Merge rephrased content into existing sections
      const updatedSections = mergeRephrasedContent(service.sections, rephrased);
      const updatedCardDesc = rephrased.cardDescription || service.cardDescription;
      const updatedSeoDesc = rephrased.seoDescription || service.seoDescription;

      if (isDryRun) {
        console.log(`   [DRY-RUN] Previewing sample changes for "${service.title}":`);
        console.log(`   • Original Card Desc: ${service.cardDescription?.slice(0, 80)}...`);
        console.log(`   • New Card Desc:      ${updatedCardDesc?.slice(0, 80)}...`);
        if (rephrased.sections?.hero?.subtitle) {
          console.log(`   • Hero Subtitle:      ${rephrased.sections.hero.subtitle.slice(0, 80)}...`);
        }
        if (rephrased.sections?.faq?.faqs?.[0]?.answer) {
          console.log(`   • FAQ Q1 Answer:      ${rephrased.sections.faq.faqs[0].answer.slice(0, 80)}...`);
        }
        console.log(`   [DRY-RUN] Service "${service.title}" successfully previewed.\n`);
      } else {
        await service.update({
          cardDescription: updatedCardDesc,
          seoDescription: updatedSeoDesc,
          sections: updatedSections,
        });
        console.log(`   ✓ Successfully updated database for "${service.title}".\n`);
      }

      successCount++;
    } catch (err: any) {
      console.error(`   ✗ Error processing "${service.title}":`, err.message);
      errorCount++;
    }

    // Rate-limiting delay between requests (1.5 seconds)
    if (i < services.length - 1) {
      await sleep(1500);
    }
  }

  console.log("=================================================================");
  console.log(`Finished! Total: ${services.length}, Succeeded: ${successCount}, Failed: ${errorCount}`);
  if (isDryRun) {
    console.log("Note: This was a dry-run. No changes were written to the database.");
    console.log("To apply changes to live database, run without --dry-run.");
  } else {
    console.log(`Backup saved at: ${backupFilePath}`);
    console.log(`To revert anytime, run: npm run services:restore -- --restore="${backupFilePath}"`);
  }
  console.log("=================================================================");

  await sequelize.close();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
