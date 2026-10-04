import { buildImage, type NewImage, type SourceConnector } from "@/lib/sources/common";

/**
 * Are.na connector (PRD §5/§5.1) — the one platform with a real, sanctioned
 * public API for this use case. We search public channels for the keyword,
 * then pull image blocks from the best-matching channels.
 *
 * Compliance pattern (PRD §5 row 1): hotlink the original image URL, never
 * re-host it, and always carry a source_url back to the block/channel on
 * Are.na. See common.ts `buildImage`, which enforces usage_mode="hotlinked"
 * for this platform at the type level.
 *
 * Docs: https://dev.are.na/documentation — base URL https://api.are.na/v2
 */

const ARENA_BASE = "https://api.are.na/v2";
const CHANNELS_PER_KEYWORD = 5;
const BLOCKS_PER_CHANNEL = 20;

interface ArenaChannelSearchResult {
  channels: Array<{ slug: string; title: string }>;
}

interface ArenaBlock {
  id: number;
  class: string; // "Image" | "Text" | "Link" | ...
  title: string | null;
  image?: {
    original: { url: string };
    display: { url: string };
  };
  user?: { slug: string };
}

interface ArenaChannelContents {
  contents: ArenaBlock[];
}

function authHeaders(): HeadersInit {
  const token = process.env.ARENA_ACCESS_TOKEN;
  if (!token) {
    throw new Error("ARENA_ACCESS_TOKEN is not set (see .env.example).");
  }
  return { Authorization: `Bearer ${token}` };
}

async function searchChannels(query: string): Promise<ArenaChannelSearchResult> {
  const res = await fetch(
    `${ARENA_BASE}/search/channels?q=${encodeURIComponent(query)}&per=${CHANNELS_PER_KEYWORD}`,
    { headers: authHeaders() }
  );
  if (!res.ok) {
    throw new Error(`Are.na channel search failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function getChannelContents(slug: string): Promise<ArenaChannelContents> {
  const res = await fetch(
    `${ARENA_BASE}/channels/${encodeURIComponent(slug)}/contents?per=${BLOCKS_PER_CHANNEL}`,
    { headers: authHeaders() }
  );
  if (!res.ok) {
    throw new Error(`Are.na channel contents failed for "${slug}": ${res.status}`);
  }
  return res.json();
}

export const arenaConnector: SourceConnector = {
  platform: "arena",

  async fetchForKeyword(keywordSlug, keywordLabel): Promise<NewImage[]> {
    const { channels } = await searchChannels(keywordLabel);
    const images: NewImage[] = [];

    for (const channel of channels) {
      let contents: ArenaChannelContents;
      try {
        contents = await getChannelContents(channel.slug);
      } catch (err) {
        console.warn(`Skipping Are.na channel "${channel.slug}": ${String(err)}`);
        continue;
      }

      for (const block of contents.contents) {
        if (block.class !== "Image" || !block.image) continue;

        const sourceUrl = block.user
          ? `https://www.are.na/${block.user.slug}/${channel.slug}`
          : `https://www.are.na/block/${block.id}`;

        images.push(
          buildImage({
            sourcePlatform: "arena",
            imageUrl: block.image.original.url,
            thumbnailUrl: block.image.display.url,
            sourceUrl,
            keywords: [keywordSlug],
            licenseCredit: `via Are.na${block.user ? ` · ${block.user.slug}` : ""}`,
          })
        );
      }
    }

    return images;
  },
};
