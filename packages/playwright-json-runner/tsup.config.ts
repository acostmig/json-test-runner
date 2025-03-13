import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts", 
    "src/runner-playwright.ts", 
    "src/scripts/**"
  ],  
  format: ["cjs", "esm"],
  dts: {resolve:true}, 
  sourcemap: true,
  clean: true,
  bundle: true,
  outDir: "dist",
  treeshake: true,
  tsconfig: "tsconfig.json"
});