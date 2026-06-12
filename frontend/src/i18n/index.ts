/**
 * react-i18next bootstrap. Loads the English source bundle synchronously and
 * lazy-imports the other locales on demand so the initial paint stays small
 * (each non-default JSON adds a few KB; loading 8 of them up front would
 * pad the bundle without payoff for English-speaking visitors).
 *
 * The active locale is determined in priority order:
 *   1. URL prefix (`/es/...`) — the source of truth, what crawlers see.
 *   2. velxio_locale cookie — sticky preference, shared with the blog.
 *   3. Browser languages — Accept-Language fallback.
 *   4. DEFAULT_LOCALE ("en") — last resort.
 *
 * The URL is the source of truth at runtime; the cookie only seeds the
 * very first navigation so a returning visitor lands on their language
 * without a redirect.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import viCommon from './locales/vi/common.json';
import viCommon2 from './locales/vi/common2.json';
import viReleases from './locales/vi/releases.json';
import viDocs from './locales/vi/docs.json';
import viDocs2 from './locales/vi/docs2.json';
import viSeo from './locales/vi/seo.json';
import viSeo2 from './locales/vi/seo2.json';
import viSeo3 from './locales/vi/seo3.json';
import viSeo4 from './locales/vi/seo4.json';
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from './config';
import { getLocaleFromPath } from './path';
import { readLocaleCookie } from './cookie';

const NAMESPACES = ['common'] as const;
type Namespace = (typeof NAMESPACES)[number];

const SUPPORTED_LANGS = LOCALES as readonly string[];

/**
 * Resolve the locale to start with. URL beats cookie beats browser locale.
 */
function pickInitialLocale(): Locale {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const fromUrl = getLocaleFromPath(pathname);
    if (fromUrl !== DEFAULT_LOCALE) return fromUrl;
    const fromCookie = readLocaleCookie();
    if (fromCookie) return fromCookie;
    const navLangs = (navigator.languages?.length ? navigator.languages : [navigator.language])
      .map((l) => l?.toLowerCase() ?? '')
      .filter(Boolean);
    for (const tag of navLangs) {
      if (isLocale(tag)) return tag;
      const base = tag.split('-')[0];
      if (isLocale(base)) return base;
    }
  }
  return DEFAULT_LOCALE;
}

/**
 * Lazy-load a non-English locale's bundle and register it with i18next.
 * Returns once the resources are available so callers can `await` it
 * before triggering i18n.changeLanguage() for instant UI swap.
 */
export async function loadLocale(locale: Locale): Promise<void> {
  if (locale === DEFAULT_LOCALE) return;
  if (i18n.hasResourceBundle(locale, 'common')) return;
  try {
    const [
      commonMod,
      common2Mod,
      releasesMod,
      docsMod,
      docs2Mod,
      seoMod,
      seo2Mod,
      seo3Mod,
      seo4Mod,
    ] = await Promise.all([
      import(`./locales/${locale}/common.json`),
      import(`./locales/${locale}/common2.json`).catch(() => ({ default: {} })),
      import(`./locales/${locale}/releases.json`),
      import(`./locales/${locale}/docs.json`),
      import(`./locales/${locale}/docs2.json`),
      import(`./locales/${locale}/seo.json`).catch(() => ({ default: { seo: {} } })),
      import(`./locales/${locale}/seo2.json`).catch(() => ({ default: { seo: {} } })),
      import(`./locales/${locale}/seo3.json`).catch(() => ({ default: { seo: {} } })),
      import(`./locales/${locale}/seo4.json`).catch(() => ({ default: { seo: {} } })),
    ]);
    const docs1Body = (docsMod.default ?? docsMod).docs ?? {};
    const docs2Body = (docs2Mod.default ?? docs2Mod).docs ?? {};
    const seoBody = {
      ...((seoMod.default ?? seoMod).seo ?? {}),
      ...((seo2Mod.default ?? seo2Mod).seo ?? {}),
      ...((seo3Mod.default ?? seo3Mod).seo ?? {}),
      ...((seo4Mod.default ?? seo4Mod).seo ?? {}),
    };
    const merged = {
      ...(commonMod.default ?? commonMod),
      ...(common2Mod.default ?? common2Mod),
      ...(releasesMod.default ?? releasesMod),
      seo: seoBody,
      docs: { ...docs1Body, ...docs2Body },
    };
    i18n.addResourceBundle(locale, 'common', merged, true, true);
  } catch (err) {
    console.error('[i18n] Failed to load locale:', locale, err);
  }
}

/**
 * Bootstrap i18next. Must be called and `await`ed in main.tsx BEFORE
 * createRoot().render(), so that non-English locale bundles are loaded
 * before the first React render.
 */
export async function bootstrapI18n(): Promise<void> {
  const initialLocale = pickInitialLocale();

  // Register the React plugin first — this unlocks hasResourceBundle().
  i18n.use(initReactI18next);

  // Always init with Vietnamese resources (they are inlined and synchronous).
  // This is fast for Vietnamese users and provides a working fallback while
  // non-Vietnamese bundles load asynchronously.
  i18n.init({
    resources: {
      vi: {
        common: {
          ...viCommon,
          ...viCommon2,
          ...viReleases,
          seo: {
            ...viSeo.seo,
            ...viSeo2.seo,
            ...viSeo3.seo,
            ...viSeo4.seo,
          },
          docs: { ...viDocs.docs, ...viDocs2.docs },
        },
      },
    },
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LANGS,
    ns: NAMESPACES,
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false,
    },
  });

  // For non-English locales, load the bundle asynchronously and switch language.
  // The init() above guarantees hasResourceBundle() / addResourceBundle() exist.
  if (initialLocale !== DEFAULT_LOCALE) {
    await loadLocale(initialLocale);
    await i18n.changeLanguage(initialLocale);
  }
}

export { i18n };
export type { Locale, Namespace };
