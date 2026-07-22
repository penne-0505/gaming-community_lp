import type { Env, PagesHandler } from "../types";
import Stripe from "stripe";
import { trackEvent, captureError } from "../telemetry";
import { requireSession } from "../auth";
import { getDemoCheckoutSession, isDemoMode, jsonResponse } from "../demo";

const SUBSCRIPTION_OK_STATUSES = new Set(["trialing", "active", "past_due"]);

export const onRequest: PagesHandler = async (context) => {
  const { request, env } = context;

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) {
    return new Response("Missing session_id", { status: 400 });
  }

  if (isDemoMode(env)) {
    const priceType = url.searchParams.get("plan") || "sub_monthly";
    return jsonResponse(getDemoCheckoutSession({ sessionId, priceType }));
  }

  const secretKey = env?.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
  }

  const sessionAuth = await requireSession(request, env);
  if (!sessionAuth.ok) {
    return new Response(sessionAuth.message, { status: sessionAuth.status });
  }

  // Use account default API version; avoid pinning to unavailable future versions.
  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "subscription", "line_items"],
    });

    const status = session.status;
    const paymentStatus = session.payment_status;
    const mode = session.mode;
    const subscriptionStatus =
      session.subscription && typeof session.subscription === "object"
        ? session.subscription.status
        : null;

    const isSubscriptionOk =
      mode === "subscription" &&
      subscriptionStatus &&
      SUBSCRIPTION_OK_STATUSES.has(subscriptionStatus);
    const isPaymentOk = paymentStatus === "paid";
    const isComplete = status === "complete" && (isPaymentOk || isSubscriptionOk);

    if (!isComplete) {
      return new Response(
        JSON.stringify({
          ok: false,
          status,
          payment_status: paymentStatus,
          subscription_status: subscriptionStatus,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const lineItem = session.line_items?.data?.[0];
    const priceType = session.metadata?.price_type || null;
    const ownerId = await resolveOwnerDiscordId(session, stripe);

    if (!ownerId || ownerId !== sessionAuth.userId) {
      return new Response("Forbidden", { status: 403 });
    }

    trackEvent("checkout_session_fetch_success", { mode, status, paymentStatus, priceType }, env);

    return new Response(
      JSON.stringify({
        ok: true,
        session: {
          id: session.id,
          status,
          payment_status: paymentStatus,
          mode,
          amount_total: session.amount_total ?? null,
          currency: session.currency ?? null,
          created: session.created ? new Date(session.created * 1000).toISOString() : null,
          price_type: priceType,
          payment_method_types: session.payment_method_types ?? [],
          transaction_id:
            (typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id) || session.id,
          line_item_name: lineItem?.description || lineItem?.price?.nickname || null,
          subscription_status: subscriptionStatus,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    captureError(err, { stage: "checkout_session_fetch" }, env);
    return new Response("Failed to load checkout session", { status: 500 });
  }
};

async function resolveOwnerDiscordId(session: any, stripe: any) {
  if (session?.metadata?.discord_user_id) {
    return session.metadata.discord_user_id;
  }

  if (session?.customer) {
    const customer = await stripe.customers.retrieve(session.customer);
    if (!customer.deleted && customer.metadata?.discord_user_id) {
      return customer.metadata.discord_user_id;
    }
  }

  return null;
}
