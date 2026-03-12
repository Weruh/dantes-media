import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const frontendRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: frontendRoot,
  plugins: [
    react(),
    {
      name: "copy-htaccess-for-spa-fallback",
      closeBundle() {
        const source = resolve(frontendRoot, "public", ".htaccess");
        const target = resolve(frontendRoot, "dist", ".htaccess");
        if (existsSync(source)) {
          copyFileSync(source, target);
        }
      },
    },
  ],
  server: {
    allowedHosts: ["unpatent-unsnaffled-radia.ngrok-free.dev"],
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
