import * as Sentry from "@sentry/cloudflare";
import type { Env } from "./types";

// Global middleware for Cloudflare Pages Functions.
// Initializes Sentry once per request and enables automatic capture for uncaught errors.
// Note: @sentry/cloudflare requires Cloudflare compatibility flag "nodejs_als" (recommended)
// or "nodejs_compat".

export const onRequest = Sentry.sentryPagesPlugin((context: { env?: Env }) => ({
  dsn: context.env?.SENTRY_DSN,
  // We only need error reporting for now; tracing is intentionally disabled.
  tracesSampleRate: 0,
}));
