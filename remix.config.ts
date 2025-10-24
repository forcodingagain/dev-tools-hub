import type { Config } from "@remix-run/dev"
import { vitePlugin as remixVitePlugin } from "@remix-run/dev"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    remixVitePlugin({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
})