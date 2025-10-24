import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "~": "./app",
      "@/components": "./app/components",
      "@/lib": "./app/lib",
      "@/styles": "./app/styles",
      "@/types": "./app/types",
    },
  },
});