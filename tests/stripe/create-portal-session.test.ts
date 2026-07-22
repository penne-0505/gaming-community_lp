import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEnv } from "../utils/env.js";
import { createContext, createRequest, readJson } from "../utils/http.js";

const stripeMock = {
  customers: {
    search: vi.fn(),
  },
  billingPortal: {
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

const { onRequest } = await import("../../functions/create-portal-session.js");

beforeEach(() => {
  vi.clearAllMocks();
  stripeMock.customers.search.mockResolvedValue({ data: [{ id: "cus_1" }] });
  stripeMock.billingPortal.sessions.create.mockResolvedValue({ url: "https://stripe/portal" });
  vi.mocked(requireSession).mockResolvedValue({ ok: true, userId: "user_1" });
});

describe("create-portal-session", () => {
  it("rejects non-POST", async () => {
    const request = createRequest({ method: "GET" });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(405);
  });

  it("returns 500 when Stripe env is missing", async () => {
    const env = createEnv({ STRIPE_SECRET_KEY: "" });
    const request = createRequest({ method: "POST", json: {} });
    const response = await onRequest(createContext({ request, env }));
    expect(response.status).toBe(500);
  });

  it("returns session error when auth fails", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      ok: false,
      status: 401,
      message: "Unauthorized",
    });
    const request = createRequest({ method: "POST", json: {} });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(401);
  });

  it("returns 404 when customer not found", async () => {
    stripeMock.customers.search.mockResolvedValue({ data: [] });
    const request = createRequest({ method: "POST", json: {} });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(404);
  });

  it("creates portal session and returns url", async () => {
    const request = createRequest({ method: "POST", json: {} });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(200);
    const body = await readJson<any>(response);

    expect(body).toEqual({ url: "https://stripe/portal" });
    expect(stripeMock.billingPortal.sessions.create).toHaveBeenCalled();
  });

  it("returns 500 on Stripe error", async () => {
    stripeMock.billingPortal.sessions.create.mockRejectedValue(new Error("boom"));
    const request = createRequest({ method: "POST", json: {} });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(500);
  });
});
