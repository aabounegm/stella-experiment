import { defineConfig } from "vite";
import importMetaUrlPlugin from "@codingame/esbuild-import-meta-url-plugin";

export default defineConfig({
  build: {
    target: "esnext",
  },
  base: "",
  resolve: {
    dedupe: ["vscode"],
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [importMetaUrlPlugin],
    },
  },
  worker: {
    format: "es",
  },
  server: {
    port: 5173,
  },
});
