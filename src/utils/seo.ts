import { useEffect } from "react";
import { DEMO_SITE } from "../constants/demo";

export interface SeoOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: string;
  noIndex?: boolean;
  locale?: string;
  schemaId?: string;
  schema?: Record<string, unknown> | null;
}

const getBaseUrl = (): string => {
  if (import.meta?.env?.VITE_APP_BASE_URL) {
    return import.meta.env.VITE_APP_BASE_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
};

const getSiteDefaults = () => ({
  baseUrl: getBaseUrl(),
  siteName: import.meta.env.VITE_SITE_NAME || DEMO_SITE.name,
  description: import.meta.env.VITE_SITE_DESCRIPTION || DEMO_SITE.description,
  ogImage: import.meta.env.VITE_SITE_OG_IMAGE || "",
  logo: import.meta.env.VITE_SITE_LOGO || "",
  twitter: import.meta.env.VITE_SITE_TWITTER || "",
  socials: (import.meta.env.VITE_SITE_SOCIALS || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean),
  locale: import.meta.env.VITE_SITE_LOCALE || "ja_JP",
});

const normalizeUrl = (base: string, path = ""): string => {
  if (!base) return "";
  try {
    return new URL(path, base).toString();
  } catch {
    return "";
  }
};

const upsertMeta = ({
  name,
  property,
  content,
}: {
  name?: string;
  property?: string;
  content?: string | null;
}): void => {
  const attr = name ? "name" : "property";
  const key = name || property;
  if (!key) return;
  const selector = `meta[${attr}="${key}"]`;
  const existing = document.head.querySelector(selector);

  if (!content) {
    if (existing) existing.remove();
    return;
  }

  const meta = existing || document.createElement("meta");
  meta.setAttribute(attr, key);
  meta.setAttribute("content", content);
  if (!existing) document.head.appendChild(meta);
};

const upsertLink = ({
  rel,
  href,
  ...rest
}: {
  rel?: string;
  href?: string;
  hreflang?: string;
  [key: string]: string | undefined;
}): void => {
  if (!rel) return;
  const selectorParts = [`link[rel="${rel}"]`];
  if (rest.hreflang) selectorParts.push(`[hreflang="${rest.hreflang}"]`);
  const selector = selectorParts.join("");
  const existing = document.head.querySelector(selector);

  if (!href) {
    if (existing) existing.remove();
    return;
  }

  const link = existing || document.createElement("link");
  link.setAttribute("rel", rel);
  link.setAttribute("href", href);
  Object.entries(rest).forEach(([key, value]) => {
    if (value) link.setAttribute(key, value);
  });
  if (!existing) document.head.appendChild(link);
};

const upsertJsonLd = ({
  id,
  data,
}: {
  id?: string;
  data?: Record<string, unknown> | null;
}): void => {
  if (!id) return;
  const selector = `script[data-seo-jsonld="${id}"]`;
  const existing = document.head.querySelector(selector);

  if (!data) {
    if (existing) existing.remove();
    return;
  }

  const script = (existing as HTMLScriptElement | null) || document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-seo-jsonld", id);
  script.textContent = JSON.stringify(data);
  if (!existing) document.head.appendChild(script);
};

const applySeo = (options: SeoOptions = {}): void => {
  if (typeof document === "undefined") return;

  const defaults = getSiteDefaults();
  const fullTitle = options.title ? `${options.title} | ${defaults.siteName}` : defaults.siteName;
  const description = options.description || defaults.description;
  const path = options.path ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const canonical = normalizeUrl(defaults.baseUrl, path);
  const ogImage = options.image || defaults.ogImage;
  const locale = options.locale || defaults.locale;
  const type = options.type || "website";
  const noIndex = Boolean(options.noIndex);

  document.title = fullTitle;

  upsertMeta({ name: "description", content: description });
  upsertMeta({ name: "robots", content: noIndex ? "noindex,nofollow" : null });

  upsertLink({ rel: "canonical", href: canonical });
  if (canonical) {
    upsertLink({ rel: "alternate", href: canonical, hreflang: "ja" });
    upsertLink({ rel: "alternate", href: canonical, hreflang: "x-default" });
  }

  upsertMeta({ property: "og:title", content: fullTitle });
  upsertMeta({ property: "og:description", content: description });
  upsertMeta({ property: "og:type", content: type });
  upsertMeta({ property: "og:url", content: canonical });
  upsertMeta({ property: "og:site_name", content: defaults.siteName });
  upsertMeta({ property: "og:locale", content: locale });
  upsertMeta({ property: "og:image", content: ogImage });

  const twitterCard = ogImage ? "summary_large_image" : "summary";
  upsertMeta({ name: "twitter:card", content: twitterCard });
  upsertMeta({ name: "twitter:title", content: fullTitle });
  upsertMeta({ name: "twitter:description", content: description });
  upsertMeta({ name: "twitter:image", content: ogImage });
  upsertMeta({ name: "twitter:site", content: defaults.twitter });

  upsertJsonLd({ id: options.schemaId || "primary", data: options.schema });
};

export const useSeo = (options: SeoOptions = {}): void => {
  const { title, description, path, image, type, noIndex, locale, schemaId, schema } = options;

  useEffect(() => {
    applySeo({
      title,
      description,
      path,
      image,
      type,
      noIndex,
      locale,
      schemaId,
      schema,
    });
  }, [title, description, path, image, type, noIndex, locale, schemaId, schema]);
};

export { getSiteDefaults, normalizeUrl };
