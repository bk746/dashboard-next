import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SiteSignals {
  url: string;
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  hasViewportMeta: boolean;
  hasFavicon: boolean;
  hasOpenGraph: boolean;
  ctaCount: number;
  formCount: number;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  textLength: number;
  hasHttps: boolean;
  hasSocialLinks: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
  hasAddress: boolean;
  scripts: number;
  stylesheets: number;
  pagesAnalyzed: { url: string; title: string; h1: string }[];
}

export interface AnalyseProblem {
  id: string;
  category: "design" | "conversion" | "mobile" | "seo" | "performance" | "contenu" | "confiance" | "technique";
  severity: "critique" | "important" | "mineur";
  title: string;
  description: string;
  recommendation: string;
  impact: number;
}

export interface AnalyseResult {
  url: string;
  score: number;
  scoreLabel: string;
  problems: AnalyseProblem[];
  pitchCourt: string;
  pitchDetaille: string;
  pointsForts: string[];
  resumeExecutif: string;
}

/* ------------------------------------------------------------------ */
/*  Scraper client (calls the Playwright sidecar server on :3099)      */
/* ------------------------------------------------------------------ */

const SCRAPER_URL = "http://localhost:3099";

async function scrapePages(urls: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const res = await fetch(SCRAPER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
      signal: AbortSignal.timeout(50000),
    });
    if (!res.ok) return map;
    const data = await res.json() as { results: Record<string, string> };
    for (const [url, html] of Object.entries(data.results ?? {})) {
      map.set(url, html);
    }
  } catch {
    /* scraper not reachable */
  }
  return map;
}

/* ------------------------------------------------------------------ */
/*  Internal link extraction                                           */
/* ------------------------------------------------------------------ */

function extractInternalLinks(html: string, baseUrl: string, max = 5): string[] {
  const $ = cheerio.load(html);
  const origin = new URL(baseUrl).origin;
  const seen = new Set<string>();
  const links: string[] = [];

  $("a[href]").each((_, el) => {
    if (links.length >= max) return false;
    const raw = $(el).attr("href") ?? "";
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;
    try {
      const resolved = new URL(raw, baseUrl);
      if (resolved.origin !== origin) return;
      const clean = resolved.origin + resolved.pathname.replace(/\/$/, "");
      if (seen.has(clean) || clean === baseUrl.replace(/\/$/, "")) return;
      seen.add(clean);
      links.push(resolved.href);
    } catch {
      /* skip */
    }
  });
  return links;
}

/* ------------------------------------------------------------------ */
/*  Signal extraction                                                  */
/* ------------------------------------------------------------------ */

function extractSignals(htmlMap: Map<string, string>, rootUrl: string): SiteSignals {
  const rootHtml = htmlMap.get(rootUrl) ?? "";
  const $ = cheerio.load(rootHtml);

  const title = $("title").first().text().trim();
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const h1 = $("h1").map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 5);
  const h2 = $("h2").map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 8);
  const hasViewportMeta = $('meta[name="viewport"]').length > 0;
  const hasFavicon =
    $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').length > 0;
  const hasOpenGraph = $('meta[property^="og:"]').length > 0;

  const ctaTexts = ["devis", "contact", "appel", "réserv", "prendre", "demande", "gratuit", "essai"];
  let ctaCount = 0;
  $("a, button").each((_, el) => {
    const txt = $(el).text().toLowerCase();
    if (ctaTexts.some((k) => txt.includes(k))) ctaCount++;
  });

  const formCount = $("form").length;
  const imageCount = $("img").length;
  const imagesWithoutAlt = $("img").filter((_, el) => !$(el).attr("alt")?.trim()).length;

  const origin = new URL(rootUrl).origin;
  let internalLinks = 0;
  let externalLinks = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    try {
      const u = new URL(href, rootUrl);
      if (u.origin === origin) internalLinks++;
      else externalLinks++;
    } catch {
      internalLinks++;
    }
  });

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const textLength = bodyText.length;
  const hasHttps = rootUrl.startsWith("https");

  const socialDomains = ["facebook", "instagram", "linkedin", "twitter", "x.com", "youtube", "tiktok"];
  let hasSocialLinks = false;
  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") ?? "").toLowerCase();
    if (socialDomains.some((d) => href.includes(d))) {
      hasSocialLinks = true;
      return false;
    }
  });

  const fullText = bodyText.toLowerCase();
  const hasPhone = /(\+?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d)/.test(fullText) || /tel[:\s]/.test(fullText);
  const hasEmail = /[\w.-]+@[\w.-]+\.\w{2,}/.test(fullText);
  const hasAddress = /(rue|avenue|boulevard|chemin|place|impasse|allée|bis|ter|\d{5}\s)/i.test(fullText);

  const scripts = $("script[src]").length;
  const stylesheets = $('link[rel="stylesheet"]').length;

  const pagesAnalyzed: { url: string; title: string; h1: string }[] = [];
  for (const [pageUrl, pageHtml] of htmlMap) {
    const p$ = cheerio.load(pageHtml);
    pagesAnalyzed.push({
      url: pageUrl,
      title: p$("title").first().text().trim(),
      h1: p$("h1").first().text().trim(),
    });
  }

  return {
    url: rootUrl,
    title,
    metaDescription,
    h1,
    h2,
    hasViewportMeta,
    hasFavicon,
    hasOpenGraph,
    ctaCount,
    formCount,
    imageCount,
    imagesWithoutAlt,
    internalLinks,
    externalLinks,
    textLength,
    hasHttps,
    hasSocialLinks,
    hasPhone,
    hasEmail,
    hasAddress,
    scripts,
    stylesheets,
    pagesAnalyzed,
  };
}

/* ------------------------------------------------------------------ */
/*  OpenAI prompt                                                      */
/* ------------------------------------------------------------------ */

function buildPrompt(signals: SiteSignals): string {
  return `Tu es un expert UX / UI / SEO / conversion web. On te donne les signaux extraits d'un site web réel.

SIGNAUX DU SITE : ${signals.url}
─────────────────────────────────
Titre : ${signals.title || "(vide)"}
Meta description : ${signals.metaDescription || "(vide)"}
Titres H1 (page d'accueil) : ${signals.h1.join(" | ") || "(aucun)"}
Titres H2 (page d'accueil) : ${signals.h2.join(" | ") || "(aucun)"}
Viewport meta : ${signals.hasViewportMeta ? "oui" : "NON"}
Favicon : ${signals.hasFavicon ? "oui" : "non"}
Open Graph : ${signals.hasOpenGraph ? "oui" : "non"}
HTTPS : ${signals.hasHttps ? "oui" : "NON"}
CTA détectés : ${signals.ctaCount}
Formulaires : ${signals.formCount}
Images : ${signals.imageCount} (sans alt : ${signals.imagesWithoutAlt})
Liens internes : ${signals.internalLinks} | Liens externes : ${signals.externalLinks}
Longueur texte body : ${signals.textLength} caractères
Scripts JS : ${signals.scripts} | Feuilles CSS : ${signals.stylesheets}
Téléphone visible : ${signals.hasPhone ? "oui" : "non"}
Email visible : ${signals.hasEmail ? "oui" : "non"}
Adresse physique : ${signals.hasAddress ? "oui" : "non"}
Réseaux sociaux : ${signals.hasSocialLinks ? "oui" : "non"}
Pages analysées (${signals.pagesAnalyzed.length}) :
${signals.pagesAnalyzed.map((p) => `  • ${p.url} — titre: "${p.title}" — H1: "${p.h1}"`).join("\n")}
─────────────────────────────────

INSTRUCTIONS :
1. Analyse tous ces signaux comme si tu visitais le site toi-même.
2. Identifie entre 4 et 10 problèmes concrets, classés par sévérité et impact business.
3. Donne un score global sur 100.
4. Rédige un pitch commercial court (3-4 phrases percutantes pour convaincre le client) et un pitch détaillé (8-12 phrases, professionnel, avec les données).
5. Liste 2-4 points forts du site (même s'il est perfectible, trouve du positif).
6. Rédige un résumé exécutif (5-6 phrases synthétiques pour un décideur pressé).

Catégories possibles pour les problèmes : design, conversion, mobile, seo, performance, contenu, confiance, technique.
Sévérités : critique (bloque la conversion), important (freine significativement), mineur (amélioration souhaitable).

RÉPONDS UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "score": <number 0-100>,
  "scoreLabel": "<Critique|Fragile|Correct|Bon|Excellent>",
  "problems": [
    {
      "id": "<string unique>",
      "category": "<design|conversion|mobile|seo|performance|contenu|confiance|technique>",
      "severity": "<critique|important|mineur>",
      "title": "<titre court du problème>",
      "description": "<description concrète, basée sur les signaux>",
      "recommendation": "<action corrective précise>",
      "impact": <number 1-10>
    }
  ],
  "pitchCourt": "<pitch 3-4 phrases>",
  "pitchDetaille": "<pitch 8-12 phrases>",
  "pointsForts": ["<point fort>", ...],
  "resumeExecutif": "<résumé exécutif 5-6 phrases>"
}`;
}

/* ------------------------------------------------------------------ */
/*  Route handler                                                      */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl: string = body?.url ?? "";
    if (!rawUrl.trim()) {
      return NextResponse.json({ error: "URL manquante" }, { status: 400 });
    }

    const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Clé OPENAI_API_KEY manquante — ajoutez-la dans .env.local" },
        { status: 500 }
      );
    }

    // Step 1 : scrape root page via Playwright sidecar
    const rootMap = await scrapePages([url]);
    const rootHtml = rootMap.get(url);
    if (!rootHtml) {
      return NextResponse.json(
        { error: "Impossible de charger le site. Vérifiez que le scraper Playwright tourne (node scripts/scraper-server.mjs) et que l'URL est accessible." },
        { status: 422 }
      );
    }

    // Step 2 : find internal links and scrape them
    const subLinks = extractInternalLinks(rootHtml, url, 5);
    const htmlMap = new Map<string, string>();
    htmlMap.set(url, rootHtml);

    if (subLinks.length > 0) {
      const subMap = await scrapePages(subLinks);
      for (const [k, v] of subMap) htmlMap.set(k, v);
    }

    // Step 3 : extract signals
    const signals = extractSignals(htmlMap, url);

    // Step 4 : call GPT-4o
    const prompt = buildPrompt(signals);
    const openai = new OpenAI({ apiKey });
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      max_tokens: 3000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Tu es un expert en audit de sites web. Réponds uniquement en JSON valide, en français." },
        { role: "user", content: prompt },
      ],
    });

    const raw = chat.choices[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Réponse IA invalide — réessayez." }, { status: 502 });
    }

    const result: AnalyseResult = {
      url,
      score: typeof parsed.score === "number" ? parsed.score : 50,
      scoreLabel: (parsed.scoreLabel as string) ?? "Correct",
      problems: Array.isArray(parsed.problems) ? parsed.problems as AnalyseProblem[] : [],
      pitchCourt: (parsed.pitchCourt as string) ?? "",
      pitchDetaille: (parsed.pitchDetaille as string) ?? "",
      pointsForts: Array.isArray(parsed.pointsForts) ? parsed.pointsForts as string[] : [],
      resumeExecutif: (parsed.resumeExecutif as string) ?? "",
    };

    result.problems.sort((a, b) => {
      const sev = { critique: 0, important: 1, mineur: 2 };
      return (sev[a.severity] ?? 1) - (sev[b.severity] ?? 1) || b.impact - a.impact;
    });

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[analyse-site]", msg, err);
    return NextResponse.json({ error: `Erreur interne : ${msg}` }, { status: 500 });
  }
}
