import { getRelativeLocaleUrl } from "astro:i18n";
import { DEFAULT_LANG, LANGS, type Lang } from "./config";
import en from "./locales/en.json";
import kk from "./locales/kk.json";
import ru from "./locales/ru.json";

const dictionaries: Record<Lang, Record<string, unknown>> = { ru, kk, en };

export function getLang(locale: string | undefined): Lang {
  if (locale && (LANGS as readonly string[]).includes(locale)) return locale as Lang;
  return DEFAULT_LANG;
}

export function t(lang: Lang, key: string): string {
  const parts = key.split(".");
  let cur: unknown = dictionaries[lang];
  for (const part of parts) {
    if (cur && typeof cur === "object" && part in cur) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof cur === "string" ? cur : key;
}

export function useTranslations(locale: string | undefined) {
  const lang = getLang(locale);
  return (key: string) => t(lang, key);
}

/** Strip trailing slashes except for `/`. */
export function stripTrailingSlash(pathname: string): string {
  if (pathname === "/" || pathname === "") return "/";
  return pathname.replace(/\/+$/, "");
}

/** Path without /kk or /en prefix, always starting with /; no trailing slash (except `/`). */
export function pathWithoutLocale(pathname: string): string {
  const stripped = stripTrailingSlash(pathname.replace(/^\/(kk|en)(?=\/|$)/, ""));
  return stripped || "/";
}

/** Locale-aware href without trailing slash. `path`: "", "venue", "faq", or "venue#partner-contact". */
export function localePath(locale: string, path = ""): string {
  const [rawPath, hash] = path.split("#");
  const segment = rawPath.replace(/^\//, "");
  const url = stripTrailingSlash(getRelativeLocaleUrl(locale, segment));
  return hash ? `${url}#${hash}` : url;
}

/** Absolute locale URL for canonical / hreflang (no trailing slash). */
export function localeAbsoluteUrl(site: URL | string, locale: string, pathSeg = ""): string {
  const href = new URL(localePath(locale, pathSeg), site).href;
  return href.endsWith("/") && href !== new URL("/", site).href ? href.slice(0, -1) : href;
}
