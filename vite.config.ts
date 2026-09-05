import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig(({ command, mode }): UserConfig => {
  const sandbox = Boolean(process.env.PORT);
  const config: UserConfig = {
    server: {
      host: sandbox ? true : undefined,
      port: Number(process.env.PORT) || 5173,
      strictPort: sandbox,
    },
    resolve: {
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: ["react-dom/client"],
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths(),
      tanstackStart({
        // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
        server: { entry: "server" },
      }),
      // This app is server-rendered: `vite build` alone only emits dist/client +
      // dist/server/server.js, which is a raw SSR bundle with no index.html and
      // no serverless function. A host that expects a static site (or a Build
      // Output API directory) finds nothing to serve and answers 404 on every
      // route. Nitro turns that bundle into a real deployment artifact.
      //
      // Nitro auto-detects the host from CI env vars (VERCEL=1 -> .vercel/output),
      // so `defaultPreset` only decides what a plain local build produces.
      // Force one with NITRO_PRESET=<preset> when you need to inspect it.
      ...(command === "build" ? [nitro({ defaultPreset: "node-server" })] : []),
      react(),
    ],
  };
  if (command === "build" && mode === "development") {
    config.define = { "process.env.NODE_ENV": JSON.stringify("development") };
  }
  return config;
});
