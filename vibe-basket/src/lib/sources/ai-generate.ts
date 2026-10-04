import { buildImage, type NewImage, type SourceConnector } from "@/lib/sources/common";

/**
 * AI-generated image connector (PRD §5.1 item 3) — the source we fully own,
 * used both for breadth and to top up any keyword combination that's thin
 * on real-world images (see the warning in lib/deck.ts). Pluggable by
 * design: set AI_IMAGE_PROVIDER + AI_IMAGE_API_KEY to wire one up. Until
 * then this throws a clear, specific error rather than silently no-op'ing.
 *
 * Known gap: provider-hosted generation URLs (e.g. OpenAI's) are often
 * short-lived. This connector stores whatever URL the provider returns as
 * `image_url` directly — fine for a quick trial run, but for anything
 * that needs to stay live, download the bytes and upload them to Supabase
 * Storage here before returning, then point `image_url` at that permanent
 * location. Flagging rather than silently shipping a link that expires.
 */

const IMAGES_PER_KEYWORD = 8;

function buildPrompt(keywordLabel: string): string {
  return (
    `A professional reference photograph for a brand moodboard embodying ` +
    `the aesthetic "${keywordLabel}". High quality, editorial, no text or ` +
    `logos, no visible watermark.`
  );
}

async function generateWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "gpt-image-1", prompt, n: 1, size: "1024x1024" }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI image generation failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error("OpenAI image generation returned no url");
  return url;
}

export const aiGenerateConnector: SourceConnector = {
  platform: "ai_generated",

  async fetchForKeyword(keywordSlug, keywordLabel): Promise<NewImage[]> {
    const provider = process.env.AI_IMAGE_PROVIDER;
    const apiKey = process.env.AI_IMAGE_API_KEY;

    if (!provider || !apiKey) {
      throw new Error(
        "AI image generation is not configured. Set AI_IMAGE_PROVIDER and " +
          "AI_IMAGE_API_KEY (see .env.example). Supported providers: 'openai'."
      );
    }

    const images: NewImage[] = [];
    for (let i = 0; i < IMAGES_PER_KEYWORD; i++) {
      const prompt = buildPrompt(keywordLabel);

      let imageUrl: string;
      switch (provider) {
        case "openai":
          imageUrl = await generateWithOpenAI(prompt, apiKey);
          break;
        default:
          throw new Error(
            `Unknown AI_IMAGE_PROVIDER "${provider}". Add a case in ` +
              "lib/sources/ai-generate.ts, or set it to 'openai'."
          );
      }

      images.push(
        buildImage({
          sourcePlatform: "ai_generated",
          imageUrl,
          sourceUrl: null,
          keywords: [keywordSlug],
          generationPrompt: prompt,
          licenseCredit: "AI-generated for NF Vibe Check",
        })
      );
    }
    return images;
  },
};
