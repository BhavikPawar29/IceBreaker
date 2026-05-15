import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icon.svg",
        "app-icon-192.png",
        "app-icon-512.png",
        "app-icon-maskable-512.png",
      ],
      manifest: {
        name: "Breaking Ice",
        short_name: "Breaking Ice",
        id: "/",
        description:
          "Instant conversation lines for awkward moments, dates, new friends, and group chats.",
        theme_color: "#8e3553",
        background_color: "#fcf3f4",
        display: "standalone",
        start_url: "/live",
        scope: "/",
        icons: [
          {
            src: "/app-icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/app-icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/app-icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
