import type { Env } from "./types";

// Minimal no-op telemetry hooks for Cloudflare Pages Functions.
// GA4 Measurement Protocol or Sentry SDK can be wired later.
// When env.DEBUG_TELEMETRY === "true", logs are printed to help verify call sites.

import * as Sentry from "@sentry/cloudflare";

export function trackEvent(
  name: string,
  properties: Record<string, unknown> = {},
  env: Env | Record<string, unknown> = {}
) {
  if (env?.DEBUG_TELEMETRY === "true") {
    console.log("[telemetry:event]", name, properties);
  }
  // TODO: Wire to GA4 Measurement Protocol or other collector when enabled.
}

export function captureError(
  error: unknown,
  context: Record<string, unknown> = {},
  env: Env | Record<string, unknown> = {}
) {
  if (env?.DEBUG_TELEMETRY === "true") {
    console.error("[telemetry:error]", error instanceof Error ? error.message : error, context);
  }

  if (env?.SENTRY_DSN) {
    try {
      Sentry.captureException(error, { extra: context });
    } catch {
      // ignore
    }
  }
}
