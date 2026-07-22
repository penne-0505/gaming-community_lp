import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEnv } from "../utils/env.js";
import { createContext, createRequest, readJson } from "../utils/http.js";

const stripeMock = {
  checkout: {
    sessions: {
      retrieve: vi.fn(),
    },
  },
  customers: {
    retrieve: vi.fn(),
  },
};

vi.mock("stripe", () => ({
  default: class StripeMock {
    constructor() {
      return stripeMock;
    }
  },
}));

vi.mock("../../functions/telemetry.js", () => ({
  trackEvent: vi.fn(),
  captureError: vi.fn(),
}));

vi.mock("../../functions/auth.js", () => ({
  requireSession: vi.fn(),
}));

import { requireSession } from "../../functions/auth.js";

const { onRequest } = await import("../../functions/api/checkout-session.js");

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireSession).mockResolvedValue({ ok: true, userId: "user_1" });
  stripeMock.checkout.sessions.retrieve.mockResolvedValue({
    id: "cs_1",
    status: "complete",
    payment_status: "paid",
    mode: "payment",
    metadata: { price_type: "one_month", discord_user_id: "user_1" },
    amount_total: 1200,
    currency: "jpy",
    created: 1700000000,
    payment_method_types: ["card"],
    payment_intent: { id: "pi_1" },
    line_items: { data: [{ description: "Ticket" }] },
  });
  stripeMock.customers.retrieve.mockResolvedValue({
    deleted: false,
    metadata: { discord_user_id: "user_1" },
  });
});

describe("api/checkout-session", () => {
  it("rejects non-GET", async () => {
    const request = createRequest({
      method: "POST",
      url: "https://example.com/api/checkout-session",
    });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(405);
  });

  it("returns 500 when STRIPE_SECRET_KEY missing", async () => {
    const env = createEnv({ STRIPE_SECRET_KEY: "" });
    const request = createRequest({
      method: "GET",
      url: "https://example.com/api/checkout-session?session_id=cs_1",
    });
    const response = await onRequest(createContext({ request, env }));
    expect(response.status).toBe(500);
  });

  it("returns demo session without Stripe when demo mode is enabled", async () => {
    const env = createEnv({ DEMO_MODE: "true", STRIPE_SECRET_KEY: "" });
    const request = createRequest({
      method: "GET",
      url: "https://example.com/api/checkout-session?session_id=cs_demo&plan=sub_yearly",
    });
    const response = await onRequest(createContext({ request, env }));
    const body = await readJson<any>(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.demo).toBe(true);
    expect(body.session.id).toBe("cs_demo");
    expect(body.session.price_type).toBe("sub_yearly");
    expect(stripeMock.checkout.sessions.retrieve).not.toHaveBeenCalled();
    expect(requireSession).not.toHaveBeenCalled();
  });

  it("returns 400 when session_id missing", async () => {
    const request = createRequest({
      method: "GET",
      url: "https://example.com/api/checkout-session",
    });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(400);
  });

  it("returns session error when auth fails", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      ok: false,
      status: 401,
      message: "Unauthorized",
    });
    const request = createRequest({
      method: "GET",
      url: "https://example.com/api/checkout-session?session_id=cs_1",
    });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(401);
  });

  it("returns 403 when session is incomplete", async () => {
    stripeMock.checkout.sessions.retrieve.mockResolvedValue({
      status: "open",
      payment_status: "unpaid",
      mode: "payment",
      metadata: { discord_user_id: "user_1" },
    });
    const request = createRequest({
      method: "GET",
      url: "https://example.com/api/checkout-session?session_id=cs_1",
    });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(403);
  });

  it("returns 403 when owner mismatch", async () => {
    stripeMock.checkout.sessions.retrieve.mockResolvedValue({
      status: "complete",
      payment_status: "paid",
      mode: "payment",
      metadata: { discord_user_id: "other" },
      line_items: { data: [] },
    });
    const request = createRequest({
      method: "GET",
      url: "https://example.com/api/checkout-session?session_id=cs_1",
    });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(403);
  });

  it("returns 200 when session is complete and owner matches", async () => {
    const request = createRequest({
      method: "GET",
      url: "https://example.com/api/checkout-session?session_id=cs_1",
    });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    const body = await readJson<any>(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.session.id).toBe("cs_1");
  });

  it("returns 500 on Stripe error", async () => {
    stripeMock.checkout.sessions.retrieve.mockRejectedValue(new Error("boom"));
    const request = createRequest({
      method: "GET",
      url: "https://example.com/api/checkout-session?session_id=cs_1",
    });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(500);
  });
});
