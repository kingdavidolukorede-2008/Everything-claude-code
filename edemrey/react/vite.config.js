import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Content, helpers, icons, images and CSS are shared with the static build
// in ../static/assets, so there is a single source of truth for both sites.
const shared = (p) => fileURLToPath(new URL(`../static/assets/${p}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: "./",                          // relative paths: deploy to any folder or host
  publicDir: shared("img"),            // placeholder/real photos served from the site root
  resolve: { alias: { "@data": shared("data"), "@css": shared("css") } },
  server: { fs: { allow: [".."] } },
});
