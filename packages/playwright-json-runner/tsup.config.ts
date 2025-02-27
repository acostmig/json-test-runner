import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**"],  
  format: ["cjs", "esm"],
  dts: {resolve:true}, 
  sourcemap: true,
  clean: true,
  bundle: true,
  outDir: "dist",
  treeshake: true,
  tsconfig: "tsconfig.json"
});