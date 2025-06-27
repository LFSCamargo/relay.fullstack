import { defineConfig } from "vitest/config";

const thresholds = 80;

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["dotenv/config", "./tests/setup.ts"],
    fileParallelism: false,
    coverage: {
      thresholds: {
        global: {
          lines: thresholds,
          functions: thresholds,
          branches: thresholds,
          statements: thresholds,
        },
      },
      exclude: [
        "src/db/**",
        "src/main.ts",
        "src/modules/**/types.*.ts",
        "src/modules/**/index.ts",
        "src/utils/mailing.utils.ts",
        "vitest.config.ts",
        "scripts/**",
      ],
    },
  },
});
