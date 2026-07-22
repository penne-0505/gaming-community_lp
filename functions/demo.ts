import type { Env } from "./types";

const DEMO_MODE_FLAG = "false";

export function isDemoMode(env: Env | { DEMO_MODE?: string } | null | undefined) {
  return env?.DEMO_MODE !== DEMO_MODE_FLAG;
}

export function jsonResponse(
  body: unknown,
  { status = 200, headers = {} }: { status?: number; headers?: Record<string, string> } = {}
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export function demoUnavailableResponse(message: string) {
  return jsonResponse(
    {
      ok: false,
      demo: true,
      message,
    },
    { status: 410 }
  );
}

export function getDemoUser() {
  return {
    id: "demo_user",
    username: "Demo Supporter",
    discriminator: "0000",
    avatar: null,
  };
}

export function getDemoCheckoutSession({
  sessionId = "cs_demo",
  priceType = "sub_monthly",
}: { sessionId?: string; priceType?: string } = {}) {
  return {
    ok: true,
    demo: true,
    session: {
      id: sessionId,
      status: "complete",
      payment_status: "demo",
      mode: priceType === "one_month" ? "payment" : "subscription",
      amount_total: priceType === "sub_yearly" ? 5000 : 500,
      currency: "jpy",
      created: new Date().toISOString(),
      price_type: priceType,
      payment_method_types: ["demo"],
      transaction_id: "tx_demo_portfolio",
      line_item_name: "Demo Supporter Plan",
      subscription_status: "demo",
    },
  };
}

export function getDemoSubscription() {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const end = nowSeconds + 60 * 60 * 24 * 30;
  return {
    ok: true,
    demo: true,
    subscription: {
      id: "sub_demo",
      status: "demo_cancelled",
      cancel_at_period_end: true,
      current_period_end: end,
      canceled_at: nowSeconds,
      ended_at: null,
      price_type: "sub_monthly",
      plan_label: "Demo Supporter",
      days_left: 30,
    },
  };
}

export function getDemoSupporters() {
  return {
    supporters: [
      {
        id: "demo_1",
        name: "Aoi Builder",
        avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
        plan: "Monthly",
        joinedAt: "2026-05-01",
      },
      {
        id: "demo_2",
        name: "Nagi Explorer",
        avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
        plan: "Yearly",
        joinedAt: "2026-04-18",
      },
      {
        id: "demo_3",
        name: "Sora Redstone",
        avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
        plan: "Ticket",
        joinedAt: "2026-03-29",
      },
      {
        id: "demo_4",
        name: "Mio Crafter",
        avatar: "https://cdn.discordapp.com/embed/avatars/3.png",
        plan: "Monthly",
        joinedAt: "2026-03-12",
      },
      {
        id: "demo_5",
        name: "Ren Scout",
        avatar: "https://cdn.discordapp.com/embed/avatars/4.png",
        plan: "Ticket",
        joinedAt: "2026-02-28",
      },
      {
        id: "demo_6",
        name: "Yui Garden",
        avatar: "https://cdn.discordapp.com/embed/avatars/5.png",
        plan: "Yearly",
        joinedAt: "2026-02-02",
      },
    ],
  };
}
