import esbuildPluginTsc from "esbuild-plugin-tsc";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    server: "src/server.ts",
    seed: "src/seed/index.ts",
    truncate: "src/truncate/index.ts",
  },
  outDir: "dist",
  format: ["cjs"],
  target: "node24",
  minify: true,
  sourcemap: false,
  clean: true,
  treeshake: true,
  noExternal: [/.*/],
  esbuildPlugins: [esbuildPluginTsc()],
});
