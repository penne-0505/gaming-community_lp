/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_MODE?: string;
  readonly VITE_APP_BASE_URL?: string;
  readonly VITE_DISCORD_CLIENT_ID?: string;
  readonly VITE_DISCORD_REDIRECT_URI?: string;
  readonly VITE_DISCORD_INVITE_URL?: string;
  readonly VITE_SITE_NAME?: string;
  readonly VITE_SITE_DESCRIPTION?: string;
  readonly VITE_SITE_OG_IMAGE?: string;
  readonly VITE_SITE_LOGO?: string;
  readonly VITE_SITE_TWITTER?: string;
  readonly VITE_SITE_LOCALE?: string;
  readonly VITE_SITE_SOCIALS?: string;
  readonly VITE_GA4_MEASUREMENT_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dataLayer: IArguments[] | unknown[];
  gtag: (...args: unknown[]) => void;
}

declare module "*.md?raw" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}
