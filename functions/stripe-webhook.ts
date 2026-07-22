import type { Env, PagesHandler } from "./types";
import Stripe from "stripe";
import { trackEvent, captureError } from "./telemetry";
import { isDemoMode } from "./demo";

export const onRequest: PagesHandler = async (context) => {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (isDemoMode(env)) {
    trackEvent("stripe_webhook_demo_ignored", {}, env);
    return new Response("Demo mode: webhook ignored", { status: 200 });
  }

  const stripe = getStripe(env);
  const webhookSecret = env?.STRIPE_WEBHOOK_SECRET;
  const botToken = env?.DISCORD_BOT_TOKEN;
  const guildId = env?.DISCORD_GUILD_ID;
  const roleId = env?.DISCORD_ROLE_MEMBER_ID;

  if (!webhookSecret || !botToken || !guildId || !roleId) {
    return new Response("Missing env configuration", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing Stripe-Signature", { status: 400 });
  }

  const rawBody = await request.text();
  let event;
  try {
    // Cloudflare Workers 互換の非同期検証
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    return new Response(
      `Signature verification failed: ${err instanceof Error ? err.message : String(err)}`,
      {
        status: 400,
      }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, { guildId, roleId, botToken, stripe });
        trackEvent("checkout_session_completed", { mode: event.data.object.mode }, env);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChanged(event.data.object, { guildId, roleId, botToken, stripe });
        trackEvent("subscription_changed", { status: event.data.object.status }, env);
        break;
      default:
        // 未使用イベントは 200 で握りつつログ相当のレスポンス
        return new Response("Event ignored", { status: 200 });
    }
  } catch (err) {
    // Stripe への 2xx 以外は再送されるため、明示的に 500 を返す
    captureError(err, { eventType: event?.type }, env);
    return new Response(
      `Webhook handler error: ${err instanceof Error ? err.message : String(err)}`,
      {
        status: 500,
      }
    );
  }

  return new Response("OK", { status: 200 });
};

function getStripe(env: Env) {
  const secretKey = env?.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }
  // Use account default API version; avoid pinning to unavailable future versions.
  return new Stripe(secretKey);
}

async function handleCheckoutCompleted(session: any, ctx: any) {
  const userId = await resolveDiscordUserId(session, ctx.stripe);
  if (!userId) return; // メタデータに無い場合は何もしない

  if (session.mode === "subscription" || session.mode === "payment") {
    await addRoleToMember(userId, ctx);
  }
}

async function handleSubscriptionChanged(subscription: any, ctx: any) {
  const userId = await resolveDiscordUserId(subscription, ctx.stripe);
  if (!userId) return;

  const status = subscription.status;
  if (status === "active" || status === "trialing" || status === "past_due") {
    await addRoleToMember(userId, ctx);
    return;
  }

  // canceled / unpaid / incomplete_expired などは剥奪
  await removeRoleFromMember(userId, ctx);
}

async function resolveDiscordUserId(stripeObject: any, stripe: any) {
  if (stripeObject?.metadata?.discord_user_id) {
    return stripeObject.metadata.discord_user_id;
  }

  if (stripeObject?.customer) {
    const customer = await stripe.customers.retrieve(stripeObject.customer);
    if (!customer.deleted && customer.metadata?.discord_user_id) {
      return customer.metadata.discord_user_id;
    }
  }

  return null;
}

async function addRoleToMember(
  userId: string,
  { guildId, roleId, botToken }: { guildId: string; roleId: string; botToken: string }
) {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to add role: ${res.status} ${text}`);
  }
}

async function removeRoleFromMember(
  userId: string,
  { guildId, roleId, botToken }: { guildId: string; roleId: string; botToken: string }
) {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    }
  );

  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`Failed to remove role: ${res.status} ${text}`);
  }
}
