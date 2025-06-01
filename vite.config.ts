import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "manifest.json",
          dest: ".",
        },
        {
          src: "public/icons",
          dest: ".",
        },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        sidePanel: resolve(__dirname, "index.html"),
        content: resolve(__dirname, "src/scripts/content.ts"),
        background: resolve(__dirname, "src/scripts/background.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "content" || chunkInfo.name === "background")
            return "[name].js";

          return "assets/[name]-[hash].js";
        },
      },
    },
  },
});
