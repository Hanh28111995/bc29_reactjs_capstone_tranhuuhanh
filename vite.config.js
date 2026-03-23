import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: ".",
  publicDir: "public",
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
      pages: path.resolve(__dirname, "./src/pages"),
      components: path.resolve(__dirname, "./src/components"),
      modules: path.resolve(__dirname, "./src/modules"),
      services: path.resolve(__dirname, "./src/services"),
      hooks: path.resolve(__dirname, "./src/hooks"),
      contexts: path.resolve(__dirname, "./src/contexts"),
      guards: path.resolve(__dirname, "./src/guards"),
      configs: path.resolve(__dirname, "./src/configs"),
      constants: path.resolve(__dirname, "./src/constants"),
      layouts: path.resolve(__dirname, "./src/layouts"),
      store: path.resolve(__dirname, "./src/store"),
      enums: path.resolve(__dirname, "./src/enums"),
      routes: path.resolve(__dirname, "./src/routes"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["import", "mixed-decls", "global-builtin", "color-functions"],
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase")) return "firebase";
            if (id.includes("@ant-design/pro-components")) return "pro-components";
            if (id.includes("antd") || id.includes("@ant-design")) return "antd-vendor";
            if (id.includes("react-dom") || id.includes("react-router")) return "react-vendor";
          }
        },
      },
    },
  },
});
