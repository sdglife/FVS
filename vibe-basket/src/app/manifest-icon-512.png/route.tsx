import { ImageResponse } from "next/og";
import { BrandIcon } from "@/lib/brand-icon";

// Never changes, so render once at build time rather than per request.
export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(<BrandIcon size={512} />, { width: 512, height: 512 });
}
