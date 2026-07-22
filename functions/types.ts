/**
 * Cloudflare Pages Functions environment bindings / secrets.
 * Values are strings when set via Pages dashboard or wrangler vars.
 */
export interface Env {
  DEMO_MODE?: string;
  DEBUG_TELEMETRY?: string;
  SENTRY_DSN?: string;

  APP_BASE_URL?: string;
  AUTH_TOKEN_SECRET?: string;
  AUTH_TOKEN_TTL_SECONDS?: string;

  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_ONE_MONTH?: string;
  STRIPE_PRICE_SUB_MONTHLY?: string;
  STRIPE_PRICE_SUB_YEARLY?: string;

  DISCORD_CLIENT_ID?: string;
  DISCORD_CLIENT_SECRET?: string;
  DISCORD_REDIRECT_URI?: string;
  DISCORD_BOT_TOKEN?: string;
  DISCORD_GUILD_ID?: string;
  DISCORD_ROLE_MEMBER_ID?: string;
  DISCORD_ROLE_MAX_FETCH?: string;
  DISCORD_INVITE_URL?: string;

  GA4_MEASUREMENT_ID?: string;
  GA4_API_SECRET?: string;

  [key: string]: string | undefined;
}

export type PagesContext = EventContext<Env, string, Record<string, unknown>>;
export type PagesHandler = PagesFunction<Env>;
