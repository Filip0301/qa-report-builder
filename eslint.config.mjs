import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Librerías de terceros copiadas en postinstall y reportes de cobertura.
    "public/vendor/**",
    "coverage/**",
  ]),
  {
    // Las imágenes son data-URLs embebidas por el usuario: next/image no aporta aquí.
    rules: { "@next/next/no-img-element": "off" },
  },
]);

export default eslintConfig;
