import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEnv } from "../utils/env.js";
import { createContext, createRequest, readJson } from "../utils/http.js";

const stripeMock = {
  subscriptions: {
    search: vi.fn(),
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

const { onRequest } = await import("../../functions/api/subscription-status.js");

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireSession).mockResolvedValue({ ok: true, userId: "user_1" });
  stripeMock.subscriptions.search.mockResolvedValue({ data: [] });
});

describe("api/subscription-status", () => {
  it("rejects non-GET", async () => {
    const request = createRequest({ method: "POST" });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(405);
  });

  it("returns 500 when STRIPE_SECRET_KEY missing", async () => {
    const env = createEnv({ STRIPE_SECRET_KEY: "" });
    const request = createRequest({ method: "GET" });
    const response = await onRequest(createContext({ request, env }));
    expect(response.status).toBe(500);
  });

  it("returns session error when auth fails", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      ok: false,
      status: 401,
      message: "Unauthorized",
    });
    const request = createRequest({ method: "GET" });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(401);
  });

  it("returns ok:false when no subscriptions found", async () => {
    stripeMock.subscriptions.search.mockResolvedValue({ data: [] });
    const request = createRequest({ method: "GET" });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    const body = await readJson<any>(response);
    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: false, reason: "not_found" });
  });

  it("returns ok:false when not cancelled", async () => {
    stripeMock.subscriptions.search.mockResolvedValue({
      data: [
        {
          id: "sub_1",
          status: "active",
          cancel_at_period_end: false,
          current_period_end: 1700000000,
          items: { data: [{ price: { nickname: "Monthly" } }] },
        },
      ],
    });
    const request = createRequest({ method: "GET" });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    const body = await readJson<any>(response);
    expect(body.ok).toBe(false);
    expect(body.reason).toBe("not_cancelled");
  });

  it("returns ok:true when cancelled", async () => {
    const now = 1700000000 * 1000;
    vi.spyOn(Date, "now").mockReturnValue(now);
    stripeMock.subscriptions.search.mockResolvedValue({
      data: [
        {
          id: "sub_1",
          status: "canceled",
          cancel_at_period_end: true,
          current_period_end: 1700000000 + 86400 * 2,
          metadata: { price_type: "sub_monthly" },
          items: { data: [{ price: { nickname: "Monthly" } }] },
        },
      ],
    });
    const request = createRequest({ method: "GET" });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    const body = await readJson<any>(response);
    expect(body.ok).toBe(true);
    expect(body.subscription.days_left).toBeGreaterThan(0);
  });

  it("returns 500 on Stripe error", async () => {
    stripeMock.subscriptions.search.mockRejectedValue(new Error("boom"));
    const request = createRequest({ method: "GET" });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(500);
  });
});
