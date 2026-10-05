import { ImageResponse } from "next/og";
import { BrandIcon } from "@/lib/brand-icon";

// Never changes, so render once at build time rather than per request.
export const dynamic = "force-static";

// Plain Route Handler (not the special `icon` convention) so the URL is a
// stable, explicit path the Web App Manifest's `icons[]` can reference —
// see app/manifest.ts.
export async function GET() {
  return new ImageResponse(<BrandIcon size={192} />, { width: 192, height: 192 });
}
