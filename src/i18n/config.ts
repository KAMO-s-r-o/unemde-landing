export const LANGS = ["ru", "kk", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "ru";

/** Open Graph locale tags (BCP 47 → og:locale). */
export const OG_LOCALES: Record<Lang, string> = {
  ru: "ru_RU",
  kk: "kk_KZ",
  en: "en_US",
};

export const SITE_NAME = "UNEMDE";
export const OG_IMAGE_PATH = "/og.jpg";

export const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: "ru", label: "RU" },
  { value: "kk", label: "KK" },
  { value: "en", label: "EN" },
];

export const PAGES = ["home", "venue", "faq"] as const;
export type PageId = (typeof PAGES)[number];

export const NAV_LINKS = [
  { path: "venue", key: "nav.business", page: "venue" },
  { path: "faq", key: "nav.faq", page: "faq" },
] as const;

export const PAGE_META: Record<PageId, { titleKey: string; descKey: string }> = {
  home: { titleKey: "meta.title", descKey: "meta.description" },
  venue: { titleKey: "meta.venueTitle", descKey: "meta.venueDescription" },
  faq: { titleKey: "meta.faqTitle", descKey: "meta.faqDescription" },
};
