import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig(({ command, mode }) => {
  const config: UserConfig = {
    server: {
      host: "::",
      // Env-driven so the E2E suite can pin a port. `strictPort` matters more
      // than it looks: without it Vite silently drifts to the next free port and
      // the test runner ends up polling a URL nothing is serving.
      port: Number(process.env.PORT) || 8080,
      strictPort: Boolean(process.env.PORT),
    },

    resolve: {
      alias: { "@": srcDir },
      // React and the TanStack packages break in confusing ways if two copies
      // end up in the graph (hook errors, duplicate query caches), which is easy
      // to hit once SSR and client bundles resolve separately.
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
      // Pre-bundle everything the first render pulls in. Anything discovered
      // lazily instead makes Vite re-optimize mid-load and hard-reload the page,
      // which shows up as a 504 "Outdated Optimize Dep" flash on a cold start.
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-router",
        "@tanstack/router-core",
        "@tanstack/router-core/isServer",
        "@tanstack/router-core/ssr/client",
        "@tanstack/react-query",
        "seroval",
      ],
    },

    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // Redirect TanStack Start's bundled server entry to src/server.ts, which
        // wraps SSR so h3 cannot swallow errors into an opaque 500.
        server: { entry: "server" },
      }),
      // Nitro only participates in builds; `vite dev` serves through Start.
      ...(command === "build" ? [nitro({ defaultPreset: "cloudflare-module" })] : []),
      react(),
    ],
  };

  // `build --mode development` produces a debuggable preview build: ship the
  // development React build so its warnings and component names survive.
  if (command === "build" && mode === "development") {
    config.environments = {
      client: { define: { "process.env.NODE_ENV": JSON.stringify("development") } },
    };
  }

  return config;
});
