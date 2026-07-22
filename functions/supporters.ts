import type { PagesHandler } from "./types";
// Middleware shim for /supporters route so that HTML SPA is served normally.
// Non-HTML requests are redirected to the JSON API at /api/supporters.
export const onRequest: PagesHandler = async (context) => {
  const accept = context.request.headers.get("accept") || "";

  // If browser navigates (prefers HTML), let Pages serve the static asset.
  if (accept.includes("text/html")) {
    return context.next();
  }

  // For programmatic fetches, redirect to API endpoint.
  const url = new URL("/api/supporters", context.request.url);
  return Response.redirect(url.toString(), 307);
};
