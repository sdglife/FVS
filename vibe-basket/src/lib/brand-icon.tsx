import type { ReactElement } from "react";

/**
 * Shared visual for every generated icon (favicon, apple touch icon, PWA
 * manifest icons): a tilted card on black, echoing the swipe-deck UI.
 * Kept to plain flex/div shapes — no glyphs/fonts — since that's what
 * Satori (the renderer behind next/og's ImageResponse) handles most
 * reliably across sizes.
 *
 * `padding` leaves safe-zone margin for maskable manifest icons, where
 * Android can crop to a circle/squircle and clip anything near the edge.
 */
export function BrandIcon({
  size,
  padding = 0,
}: {
  size: number;
  padding?: number;
}): ReactElement {
  const inner = size - padding * 2;
  const cardW = Math.round(inner * 0.56);
  const cardH = Math.round(inner * 0.74);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000000",
      }}
    >
      <div
        style={{
          position: "relative",
          width: inner,
          height: inner,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: cardW,
            height: cardH,
            borderRadius: Math.round(inner * 0.1),
            background: "#3f3f46",
            transform: `rotate(10deg) translate(${Math.round(inner * 0.04)}px, ${Math.round(
              inner * 0.02
            )}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: cardW,
            height: cardH,
            borderRadius: Math.round(inner * 0.1),
            background: "#ffffff",
            transform: "rotate(-8deg)",
          }}
        />
      </div>
    </div>
  );
}
