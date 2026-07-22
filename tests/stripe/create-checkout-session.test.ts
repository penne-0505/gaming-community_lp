import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEnv } from "../utils/env.js";
import { createContext, createRequest, readJson } from "../utils/http.js";

const stripeMock = {
  customers: {
    search: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  checkout: {
    sessions: {
      create: vi.fn(),
    },
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

const { onRequest } = await import("../../functions/create-checkout-session.js");

beforeEach(() => {
  vi.clearAllMocks();
  stripeMock.customers.search.mockResolvedValue({ data: [{ id: "cus_1", metadata: {} }] });
  stripeMock.customers.update.mockResolvedValue({});
  stripeMock.customers.create.mockResolvedValue({ id: "cus_new" });
  stripeMock.checkout.sessions.create.mockResolvedValue({ url: "https://stripe/checkout" });
  vi.mocked(requireSession).mockResolvedValue({ ok: true, userId: "user_1" });
});

describe("create-checkout-session", () => {
  it("rejects non-POST", async () => {
    const request = createRequest({ method: "GET" });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(405);
  });

  it("returns 503 when Stripe env is missing", async () => {
    const env = createEnv({ STRIPE_SECRET_KEY: "" });
    const request = createRequest({ method: "POST", json: { priceType: "one_month" } });
    const response = await onRequest(createContext({ request, env }));
    expect(response.status).toBe(503);
  });

  it("returns 400 on invalid JSON", async () => {
    const request = createRequest({ method: "POST", body: "not-json" });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(400);
  });

  it("returns session error when auth fails", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      ok: false,
      status: 401,
      message: "Unauthorized",
    });
    const request = createRequest({ method: "POST", json: { priceType: "one_month" } });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(401);
  });

  it("returns 400 when priceType missing", async () => {
    const request = createRequest({ method: "POST", json: {} });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when priceType invalid", async () => {
    const request = createRequest({ method: "POST", json: { priceType: "invalid" } });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(400);
  });

  it("creates checkout session and returns url", async () => {
    const request = createRequest({
      method: "POST",
      json: { priceType: "one_month", consent_roles: true, consent_terms: false },
    });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(200);
    const body = await readJson<any>(response);

    expect(body).toEqual({ url: "https://stripe/checkout" });
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalled();
  });

  it("returns demo redirect without Stripe when demo mode is enabled", async () => {
    const env = createEnv({ DEMO_MODE: "true", STRIPE_SECRET_KEY: "" });
    const request = createRequest({ method: "POST", json: { priceType: "one_month" } });
    const response = await onRequest(createContext({ request, env }));
    const body = await readJson<any>(response);

    expect(response.status).toBe(200);
    expect(body.demo).toBe(true);
    expect(body.url).toBe("https://example.com/thanks?demo=1&plan=one_month");
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
    expect(requireSession).not.toHaveBeenCalled();
  });

  it("returns 500 on Stripe error", async () => {
    stripeMock.checkout.sessions.create.mockRejectedValue(new Error("boom"));
    const request = createRequest({ method: "POST", json: { priceType: "one_month" } });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(500);
  });
});
