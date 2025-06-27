// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-relay"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom", // Use jsdom for DOM API support
    globals: true, // Enable global test APIs like `describe`, `it`
    setupFiles: "./tests/setup.tsx", // Setup file path
    css: true, // Enable CSS if you're importing CSS files in components
    coverage: {
      reporter: ["text", "lcov"], // Coverage reporters
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
      exclude: [
        "node_modules/",
        "./tests/setup.ts",
        "src/**/__generated__/*",
        "eslint.config.js",
        "vite.config.ts",
        "vitest.config.ts",
        "src/main.tsx",
        "src/components/ui/",
        "postcss.config.ts",
        "tailwind.config.ts",
        "src/modules/**/index.ts",
        "src/modules/**/index.tsx",
        "src/modules/index.ts",
        "src/modules/index.tsx",
        "src/constants",
        "src/router",
      ], // Exclude certain files from coverage
    },
  },
});
