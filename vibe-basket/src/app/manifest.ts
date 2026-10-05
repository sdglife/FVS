import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NF Vibe Check",
    short_name: "Vibe Check",
    description: "Swipe on reference images to find your brand's visual vibe.",
    start_url: "/admin",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/manifest-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/manifest-icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/manifest-icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
