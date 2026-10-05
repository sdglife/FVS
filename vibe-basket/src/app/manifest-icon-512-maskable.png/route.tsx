import { ImageResponse } from "next/og";
import { BrandIcon } from "@/lib/brand-icon";

// Never changes, so render once at build time rather than per request.
export const dynamic = "force-static";

// Maskable icons get cropped to a circle/squircle by Android, so the art
// needs real margin inside the full 512x512 canvas — roughly a 10% safe
// zone per the W3C maskable-icon guidance.
export async function GET() {
  return new ImageResponse(<BrandIcon size={512} padding={51} />, {
    width: 512,
    height: 512,
  });
}
