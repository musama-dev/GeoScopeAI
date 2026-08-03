import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function autoExitPlugin(): Plugin {
  return {
    name: "auto-exit-plugin",
    closeBundle() {
      setTimeout(() => {
        try {
          const clientDir = path.resolve(__dirname, "../dist/client");
          const distDir = path.resolve(__dirname, "../dist");
          if (fs.existsSync(clientDir)) {
            fs.cpSync(clientDir, distDir, { recursive: true });
            console.log("✓ Copied dist/client to dist root");
          }
        } catch (e) {
          console.error(e);
        }
        console.log("✓ Build complete. Exiting process cleanly.");
        process.exit(0);
      }, 1200);
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
    autoExitPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
});
