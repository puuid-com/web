import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";

export default defineConfig(
  // Global ignores
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      ".tanstack",
      "coverage",
      ".next",
      ".vite",
      ".netlify",
      ".nitro",
      ".vercel",
    ],
  },

  // Base JS and TS presets
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  ...tanstackQuery.configs["flat/recommended"],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  // React, Hooks, React Refresh, TanStack Query
  {
    files: ["**/*.{ts,tsx}"],

    languageOptions: {
      parserOptions: {
        // typed linting, auto-discovers your tsconfig files
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      react: { version: "detect" }, // silence version warnings
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "unused-imports": unusedImports,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      // Hooks best practices
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",

      // Vite Fast Refresh friendly exports
      "react-refresh/only-export-components": "warn",

      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "no-empty-pattern": "off",
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",

      "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "no-case-declarations": "off",
    },
  },

  // TanStack Query rules on your app code
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@tanstack/query/exhaustive-deps": "error",
      "@tanstack/query/no-rest-destructuring": "off",
    },
  },

  eslintConfigPrettier,
);
