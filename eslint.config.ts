import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import relay from "eslint-plugin-relay";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["packages/web/dist", "packages/web/coverage"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      relay,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "relay/graphql-syntax": "error",
      "relay/graphql-naming": "error",
      "relay/must-colocate-fragment-spreads": "warn",
      "relay/no-future-added-value": "warn",
      "relay/unused-fields": "warn",
      "relay/function-required-argument": "warn",
      "relay/hook-required-argument": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
);
