import {
  ANDROID_APK_URL,
  APPSTORE_URL,
  GOOGLEPLAY_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  SUPPORT_EMAIL,
  TELEGRAM_URL,
  TIKTOK_URL,
  WHATSAPP_URL,
} from "../data/contacts";
import { SITE_NAME } from "../i18n/config";

const LOGO_PATH = "/icon.png";

/** Site-wide Organization + MobileApplication JSON-LD (@graph). */
export function buildSiteJsonLd(site: URL | string, description: string) {
  const origin = new URL("/", site).origin;
  const logoUrl = new URL(LOGO_PATH, site).href;
  const apkUrl = new URL(ANDROID_APK_URL, site).href;
  const orgId = `${origin}/#organization`;
  const appId = `${origin}/#mobile-app`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        url: origin,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
        },
        image: logoUrl,
        email: SUPPORT_EMAIL,
        sameAs: [LINKEDIN_URL, INSTAGRAM_URL, TIKTOK_URL, TELEGRAM_URL, WHATSAPP_URL],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: SUPPORT_EMAIL,
            url: TELEGRAM_URL,
            availableLanguage: ["ru", "kk", "en"],
          },
          {
            "@type": "ContactPoint",
            contactType: "sales",
            url: WHATSAPP_URL,
            availableLanguage: ["ru", "kk", "en"],
          },
        ],
      },
      {
        "@type": "MobileApplication",
        "@id": appId,
        name: SITE_NAME,
        description,
        url: origin,
        image: logoUrl,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "iOS, Android",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "KZT",
        },
        installUrl: [APPSTORE_URL, GOOGLEPLAY_URL],
        downloadUrl: apkUrl,
        publisher: { "@id": orgId },
        author: { "@id": orgId },
      },
    ],
  };
}
