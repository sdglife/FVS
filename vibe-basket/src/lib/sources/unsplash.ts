import { buildImage, type NewImage, type SourceConnector } from "@/lib/sources/common";

/**
 * Unsplash connector (PRD §5.1) — licensed stock, zero rights ambiguity.
 * Docs: https://unsplash.com/documentation#search-photos
 */

const PER_KEYWORD = 15;

interface UnsplashSearchResponse {
  results: Array<{
    id: string;
    urls: { regular: string; thumb: string };
    links: { html: string };
    user: { name: string; links: { html: string } };
  }>;
}

export const unsplashConnector: SourceConnector = {
  platform: "stock_unsplash",

  async fetchForKeyword(keywordSlug, keywordLabel): Promise<NewImage[]> {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) {
      throw new Error("UNSPLASH_ACCESS_KEY is not set (see .env.example).");
    }

    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        keywordLabel
      )}&per_page=${PER_KEYWORD}`,
      { headers: { Authorization: `Client-ID ${key}` } }
    );
    if (!res.ok) {
      throw new Error(`Unsplash search failed: ${res.status} ${res.statusText}`);
    }
    const data: UnsplashSearchResponse = await res.json();

    return data.results.map((photo) =>
      buildImage({
        sourcePlatform: "stock_unsplash",
        imageUrl: photo.urls.regular,
        thumbnailUrl: photo.urls.thumb,
        sourceUrl: photo.links.html,
        keywords: [keywordSlug],
        licenseCredit: `Photo by ${photo.user.name} on Unsplash`,
      })
    );
  },
};
