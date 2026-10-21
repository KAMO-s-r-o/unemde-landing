import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

/** Keep sitemap/canonical URLs without a trailing slash (except site root). */
function withoutTrailingSlash(url) {
  if (url.endsWith("/") && !url.match(/^https?:\/\/[^/]+\/$/)) {
    return url.slice(0, -1);
  }
  return url;
}

export default defineConfig({
  site: "https://unemde.com",
  output: "static",
  // Both /faq and /faq/ resolve; canonical + nginx 301 keep one URL for crawlers.
  trailingSlash: "ignore",
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
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "ru",
        locales: {
          ru: "ru",
          kk: "kk",
          en: "en",
        },
      },
      serialize(item) {
        item.url = withoutTrailingSlash(item.url);
        if (item.links) {
          item.links = item.links.map((link) => ({
            ...link,
            url: withoutTrailingSlash(link.url),
          }));
        }
        return item;
      },
    }),
  ],
});
