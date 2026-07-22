import type { Env, PagesHandler } from "./types";
import Stripe from "stripe";
import { trackEvent, captureError } from "./telemetry";
import { requireSession } from "./auth";
import { isDemoMode, jsonResponse } from "./demo";

/**
 * Create Stripe Checkout Session
 * POST JSON: { priceType: "one_month" | "sub_monthly" | "sub_yearly", discord_user_id: string }
 */
export const onRequest: PagesHandler = async (context) => {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body: {
    priceType?: string;
    avatar_url?: string;
    consent_roles?: boolean;
    consent_terms?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { priceType, avatar_url, consent_roles, consent_terms } = body || {};
  if (!priceType) {
    return new Response("Missing priceType", { status: 400 });
  }

  const allowedPriceTypes = ["one_month", "sub_monthly", "sub_yearly"];
  if (!allowedPriceTypes.includes(priceType)) {
    return new Response("Invalid priceType", { status: 400 });
  }

  if (isDemoMode(env)) {
    const appBaseUrl = env?.APP_BASE_URL || new URL(request.url).origin;
    const url = `${appBaseUrl}/thanks?demo=1&plan=${encodeURIComponent(priceType)}`;
    trackEvent("checkout_demo_session_created", { priceType }, env);
    return jsonResponse({
      demo: true,
      url,
      message: "Demo mode: no Stripe Checkout session was created.",
    });
  }

  const {
    STRIPE_SECRET_KEY,
    STRIPE_PRICE_ONE_MONTH,
    STRIPE_PRICE_SUB_MONTHLY,
    STRIPE_PRICE_SUB_YEARLY,
    APP_BASE_URL,
  } = env;

  if (
    !STRIPE_SECRET_KEY ||
    !STRIPE_PRICE_ONE_MONTH ||
    !STRIPE_PRICE_SUB_MONTHLY ||
    !STRIPE_PRICE_SUB_YEARLY ||
    !APP_BASE_URL
  ) {
    return new Response("Missing Stripe env", { status: 503 });
  }

  const session = await requireSession(request, env);
  if (!session.ok) {
    return new Response(session.message, { status: session.status });
  }

  const priceMap = {
    one_month: STRIPE_PRICE_ONE_MONTH,
    sub_monthly: STRIPE_PRICE_SUB_MONTHLY,
    sub_yearly: STRIPE_PRICE_SUB_YEARLY,
  };

  const priceId = priceMap[priceType as keyof typeof priceMap];
  // Use account default API version; avoid pinning to unavailable future versions.
  const stripe = new Stripe(STRIPE_SECRET_KEY);

  const mode = priceType === "one_month" ? "payment" : "subscription";

  try {
    const customer = await findOrCreateCustomer(stripe, session.userId, avatar_url);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode,
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_BASE_URL}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_BASE_URL}/membership?checkout=cancel`,
      metadata: {
        discord_user_id: session.userId,
        price_type: priceType,
        avatar_url: avatar_url || "",
        consent_roles: String(consent_roles),
        consent_terms: String(consent_terms),
      },
      subscription_data:
        mode === "subscription"
          ? {
              metadata: { discord_user_id: session.userId, price_type: priceType },
            }
          : undefined,
      payment_intent_data:
        mode === "payment"
          ? { metadata: { discord_user_id: session.userId, price_type: priceType } }
          : undefined,
      client_reference_id: session.userId,
    });

    trackEvent("checkout_session_created", { priceType, mode, customerId: customer.id }, env);

    return new Response(JSON.stringify({ url: checkoutSession.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    captureError(err, { stage: "checkout_session_create", priceType }, env);
    return new Response("Stripe error", { status: 500 });
  }
};

async function findOrCreateCustomer(
  stripe: Stripe,
  discordUserId: string,
  avatarUrl?: string | null
) {
  // Stripe Search API is available for Customers. We rely on metadata to find the same user.
  const query = `metadata['discord_user_id']:'${discordUserId}'`;
  const existing = await stripe.customers.search({ query, limit: 1 });
  if (existing?.data?.length) {
    const customer = existing.data[0];
    if (avatarUrl && customer.metadata?.avatar_url !== avatarUrl) {
      await stripe.customers.update(customer.id, {
        metadata: { avatar_url: avatarUrl },
      });
    }
    return customer;
  }

  return stripe.customers.create({
    metadata: { discord_user_id: discordUserId, avatar_url: avatarUrl || "" },
  });
}
