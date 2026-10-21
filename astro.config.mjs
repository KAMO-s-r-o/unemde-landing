import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://unemde.com",
  output: "static",
  trailingSlash: "never",
  i18n: {
    locales: ["ru", "kk", "en"],
    defaultLocale: "ru",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
