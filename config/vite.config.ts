import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* Post-build sync plugin.
 *
 * Vite + TanStack Start runs build phases in sequence:
 *   1. Client build  → closeBundle fires (#1)
 *   2. SSR build     → closeBundle fires (#2)
 *   3. Prerender     → runs AFTER SSR closeBundle, does NOT fire closeBundle
 *
 * Prerender writes dist/client/index.html asynchronously after the SSR
 * closeBundle. The previous version called process.exit(0) at 1200ms from
 * the FIRST closeBundle, which killed Node before SSR/prerender started.
 * That meant index.html was never generated → 404 on Vercel → FOUC.
 *
 * Fix: After the 2nd closeBundle (SSR), poll for the prerendered
 * index.html to appear, then sync files and exit cleanly.
 */
let closeBundleCount = 0;

function postBuildSyncPlugin(): Plugin {
  return {
    name: "post-build-sync-plugin",
    closeBundle() {
      closeBundleCount++;
      console.log(`[post-build-sync] closeBundle call #${closeBundleCount}`);

      // After the SSR build (call #2), prerender runs asynchronously.
      // Poll for index.html to appear, then sync and exit.
      if (closeBundleCount >= 2) {
        const clientDir = path.resolve(__dirname, "../dist/client");
        const distDir = path.resolve(__dirname, "../dist");
        const prerenderIndex = path.resolve(clientDir, "index.html");

        let attempts = 0;
        const maxAttempts = 30; // 30 × 500ms = 15s max wait

        const poll = setInterval(() => {
          attempts++;
          if (fs.existsSync(prerenderIndex)) {
            clearInterval(poll);
            console.log(`✓ Prerendered index.html found after ${attempts} poll(s).`);

            try {
              // Copy client assets to dist root for Vercel static serving
              if (fs.existsSync(clientDir)) {
                fs.cpSync(clientDir, distDir, { recursive: true });
                console.log("✓ Copied dist/client → dist root");
              }
              // Ensure dist/client/index.html has the final version
              const distIndex = path.resolve(distDir, "index.html");
              if (fs.existsSync(distIndex)) {
                fs.copyFileSync(distIndex, path.resolve(clientDir, "index.html"));
                console.log("✓ Synced dist/index.html → dist/client/index.html");
              }
            } catch (e) {
              console.error("[post-build-sync] Sync error:", e);
            }

            console.log("✓ Build complete. Exiting.");
            process.exit(0);
          } else if (attempts >= maxAttempts) {
            clearInterval(poll);
            console.error("[post-build-sync] Timed out waiting for prerendered index.html!");
            // Still try to copy whatever we have and exit
            try {
              if (fs.existsSync(clientDir)) {
                fs.cpSync(clientDir, distDir, { recursive: true });
              }
            } catch (e) {
              console.error(e);
            }
            process.exit(1);
          }
        }, 500);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      server: { entry: "src/server.ts" },
      prerender: {
        enabled: true,
      },
    }),
    react(),
    tailwindcss(),
    postBuildSyncPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
});
