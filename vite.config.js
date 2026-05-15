import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Breaking Ice",
        short_name: "Breaking Ice",
        description:
          "Instant conversation lines for awkward moments, dates, new friends, and group chats.",
        theme_color: "#8e3553",
        background_color: "#fcf3f4",
        display: "standalone",
        start_url: "/live",
        scope: "/",
        icons: [
          {
            src: "/icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
          {
            src: "/icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
