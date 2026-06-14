import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Single-page interactive birthday film.
// `base` is relative so the built site can be hosted from any sub-path
// (GitHub Pages, Netlify drop, a USB stick opened in a browser, etc.).
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    target: "es2019",
    assetsInlineLimit: 0,
  },
});
