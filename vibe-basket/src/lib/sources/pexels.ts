import { buildImage, type NewImage, type SourceConnector } from "@/lib/sources/common";

/**
 * Pexels connector (PRD §5.1) — licensed stock, zero rights ambiguity.
 * Docs: https://www.pexels.com/api/documentation/#photos-search
 */

const PER_KEYWORD = 15;

interface PexelsSearchResponse {
  photos: Array<{
    id: number;
    url: string;
    src: { large: string; medium: string };
    photographer: string;
  }>;
}

export const pexelsConnector: SourceConnector = {
  platform: "stock_pexels",

  async fetchForKeyword(keywordSlug, keywordLabel): Promise<NewImage[]> {
    const key = process.env.PEXELS_API_KEY;
    if (!key) {
      throw new Error("PEXELS_API_KEY is not set (see .env.example).");
    }

    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        keywordLabel
      )}&per_page=${PER_KEYWORD}`,
      { headers: { Authorization: key } }
    );
    if (!res.ok) {
      throw new Error(`Pexels search failed: ${res.status} ${res.statusText}`);
    }
    const data: PexelsSearchResponse = await res.json();

    return data.photos.map((photo) =>
      buildImage({
        sourcePlatform: "stock_pexels",
        imageUrl: photo.src.large,
        thumbnailUrl: photo.src.medium,
        sourceUrl: photo.url,
        keywords: [keywordSlug],
        licenseCredit: `Photo by ${photo.photographer} on Pexels`,
      })
    );
  },
};
