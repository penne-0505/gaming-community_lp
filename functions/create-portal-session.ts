import type { Env, PagesHandler } from "./types";
import Stripe from "stripe";
import { trackEvent, captureError } from "./telemetry";
import { requireSession } from "./auth";
import { demoUnavailableResponse, isDemoMode } from "./demo";

/**
 * Create Stripe Billing Portal session for the logged-in Discord user.
 * POST JSON: { discord_user_id: string }
 */
export const onRequest: PagesHandler = async (context) => {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (isDemoMode(env)) {
    trackEvent("portal_demo_blocked", {}, env);
    return demoUnavailableResponse("Demo mode: Stripe Billing Portal is disabled.");
  }

  const { STRIPE_SECRET_KEY, APP_BASE_URL } = env;
  if (!STRIPE_SECRET_KEY || !APP_BASE_URL) {
    return new Response("Missing Stripe env", { status: 500 });
  }

  const session = await requireSession(request, env);
  if (!session.ok) {
    return new Response(session.message, { status: session.status });
  }

  // Use account default API version; avoid pinning to unavailable future versions.
  const stripe = new Stripe(STRIPE_SECRET_KEY);

  try {
    const customer = await findCustomerByDiscordId(stripe, session.userId);
    if (!customer) {
      return new Response("Customer not found", { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${APP_BASE_URL}/?portal=return`,
    });

    trackEvent("portal_session_created", { customerId: customer.id }, env);

    return new Response(JSON.stringify({ url: portalSession.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    captureError(err, { stage: "portal_session_create" }, env);
    return new Response("Stripe portal error", { status: 500 });
  }
};

async function findCustomerByDiscordId(stripe: import("stripe").default, discordUserId: string) {
  const query = `metadata['discord_user_id']:'${discordUserId}'`;
  const result = await stripe.customers.search({ query, limit: 1 });
  if (result?.data?.length) {
    return result.data[0];
  }
  return null;
}
