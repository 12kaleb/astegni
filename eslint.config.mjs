import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    // Network resources intentionally update React state after mount.
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".kimi-code/**",
    "scratch/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
