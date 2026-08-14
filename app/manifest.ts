import type { MetadataRoute } from "next";

const BROWN = "#6B4423";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Crappucino",
    short_name: "Crappucino",
    description: "Hit the machine. 50/50 chance of Good coffee — or Crapuccino.",
    start_url: "/",
    display: "standalone",
    background_color: BROWN,
    theme_color: BROWN,
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
