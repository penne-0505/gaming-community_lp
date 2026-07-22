import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

const baseLanguageOptions = {
  ecmaVersion: 2023,
  sourceType: "module",
};

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "public/**", "coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ...baseLanguageOptions,
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["functions/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    languageOptions: {
      ...baseLanguageOptions,
      globals: {
        ...globals.worker,
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: [
      "vite.config.ts",
      "vitest.config.ts",
      "tailwind.config.js",
      "postcss.config.js",
      "eslint.config.js",
    ],
    languageOptions: {
      ...baseLanguageOptions,
      globals: {
        ...globals.node,
      },
    },
  },
  eslintConfigPrettier
);
