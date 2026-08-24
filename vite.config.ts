import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
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
      react(),
    ],
  };
  if (command === "build" && mode === "development") {
    config.define = { "process.env.NODE_ENV": JSON.stringify("development") };
  }
  return config;
});
