import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: true,
  dts: true,
  external: [
    "react",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
    "react-dom",
  ],
});
