#!/usr/bin/env tsx
/**
 * CLI for running the automated image-source connectors (PRD §5.1).
 *
 *   npm run ingest -- --source arena --keyword minimal
 *   npm run ingest -- --source stock_unsplash --all
 *   npm run ingest -- --source ai_generated --keyword brutalist
 *
 * Loads .env.local itself (this runs outside the Next.js server, so
 * process.env isn't populated by the framework).
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { KEYWORD_TAXONOMY } from "../src/lib/keywords";
import { upsertImages } from "../src/lib/sources/common";
import { arenaConnector } from "../src/lib/sources/arena";
import { unsplashConnector } from "../src/lib/sources/unsplash";
import { pexelsConnector } from "../src/lib/sources/pexels";
import { aiGenerateConnector } from "../src/lib/sources/ai-generate";
import type { SourceConnector } from "../src/lib/sources/common";

const CONNECTORS: Record<string, SourceConnector> = {
  arena: arenaConnector,
  stock_unsplash: unsplashConnector,
  stock_pexels: pexelsConnector,
  ai_generated: aiGenerateConnector,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  return {
    source: get("--source"),
    keyword: get("--keyword"),
    all: args.includes("--all"),
  };
}

async function main() {
  const { source, keyword, all } = parseArgs();

  if (!source || !CONNECTORS[source]) {
    console.error(
      `Usage: npm run ingest -- --source <${Object.keys(CONNECTORS).join("|")}> ` +
        "(--keyword <slug> | --all)"
    );
    process.exit(1);
  }
  if (!keyword && !all) {
    console.error("Pass --keyword <slug> or --all.");
    process.exit(1);
  }

  const connector = CONNECTORS[source];
  const targets = all
    ? KEYWORD_TAXONOMY
    : KEYWORD_TAXONOMY.filter((k) => k.slug === keyword);

  if (targets.length === 0) {
    console.error(`No keyword found matching "${keyword}".`);
    process.exit(1);
  }

  let total = 0;
  for (const kw of targets) {
    console.log(`[${source}] fetching "${kw.label}" (${kw.slug})...`);
    try {
      const images = await connector.fetchForKeyword(kw.slug, kw.label);
      const { count } = await upsertImages(images);
      total += count;
      console.log(`  → upserted ${count} image(s)`);
    } catch (err) {
      console.error(`  ✗ failed for "${kw.slug}": ${String(err)}`);
    }
  }

  console.log(`Done. ${total} image(s) upserted across ${targets.length} keyword(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
