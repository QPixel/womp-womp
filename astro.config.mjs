import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [tailwind({
    applyBaseStyles: false
  }), svelte()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      configPath: "./wrangler.toml",
    }
  }),
  vite: {
    ssr: {
      external: ["node:url"]
    }
  }
});