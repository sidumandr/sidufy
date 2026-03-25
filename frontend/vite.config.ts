import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Monorepo kökü: frontend/ bir üst dizin — kök .env içindeki VITE_* değişkenleri yüklenir */
const repoRoot = path.resolve(__dirname, "..");

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, "");
  const proxyTarget =
    env.VITE_API_PROXY_TARGET?.trim() || "http://backend:8000";

  return {
    plugins: [react()],
    envDir: repoRoot,
    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
