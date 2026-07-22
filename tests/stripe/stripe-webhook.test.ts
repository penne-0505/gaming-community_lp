import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEnv } from "../utils/env.js";
import { createContext, createRequest, createTextResponse, readText } from "../utils/http.js";

const stripeMock = {
  webhooks: {
    constructEventAsync: vi.fn(),
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

const { onRequest } = await import("../../functions/stripe-webhook.js");

beforeEach(() => {
  vi.clearAllMocks();
  stripeMock.webhooks.constructEventAsync.mockResolvedValue({ type: "ignored", data: {} });
  stripeMock.customers.retrieve.mockResolvedValue({ deleted: false, metadata: {} });
  globalThis.fetch = vi.fn().mockResolvedValue(createTextResponse("ok", { status: 200 }));
});

describe("stripe-webhook", () => {
  it("rejects non-POST", async () => {
    const request = createRequest({ method: "GET" });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(405);
  });

  it("returns 500 when env missing", async () => {
    const env = createEnv({ STRIPE_WEBHOOK_SECRET: "", DISCORD_BOT_TOKEN: "" });
    const request = createRequest({
      method: "POST",
      body: "payload",
      headers: { "stripe-signature": "sig" },
    });
    const response = await onRequest(createContext({ request, env }));
    expect(response.status).toBe(500);
  });

  it("returns 400 when signature header missing", async () => {
    const request = createRequest({ method: "POST", body: "payload" });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when signature verification fails", async () => {
    stripeMock.webhooks.constructEventAsync.mockRejectedValue(new Error("bad sig"));
    const request = createRequest({
      method: "POST",
      body: "payload",
      headers: { "stripe-signature": "sig" },
    });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(400);
    const text = await readText(response);
    expect(text).toContain("Signature verification failed");
  });

  it("handles checkout.session.completed and adds role", async () => {
    stripeMock.webhooks.constructEventAsync.mockResolvedValue({
      type: "checkout.session.completed",
      data: { object: { mode: "payment", metadata: { discord_user_id: "u1" } } },
    });
    const request = createRequest({
      method: "POST",
      body: "payload",
      headers: { "stripe-signature": "sig" },
    });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(200);
    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it("handles subscription update and removes role on canceled", async () => {
    stripeMock.webhooks.constructEventAsync.mockResolvedValue({
      type: "customer.subscription.updated",
      data: { object: { status: "canceled", customer: "cus_1" } },
    });
    stripeMock.customers.retrieve.mockResolvedValue({
      deleted: false,
      metadata: { discord_user_id: "u2" },
    });
    const request = createRequest({
      method: "POST",
      body: "payload",
      headers: { "stripe-signature": "sig" },
    });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(200);
    expect(stripeMock.customers.retrieve).toHaveBeenCalledWith("cus_1");
  });

  it("returns 500 when discord API fails", async () => {
    stripeMock.webhooks.constructEventAsync.mockResolvedValue({
      type: "checkout.session.completed",
      data: { object: { mode: "payment", metadata: { discord_user_id: "u1" } } },
    });
    globalThis.fetch = vi.fn().mockResolvedValue(createTextResponse("bad", { status: 500 }));
    const request = createRequest({
      method: "POST",
      body: "payload",
      headers: { "stripe-signature": "sig" },
    });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    expect(response.status).toBe(500);
  });

  it("returns 200 for ignored events", async () => {
    stripeMock.webhooks.constructEventAsync.mockResolvedValue({
      type: "invoice.created",
      data: { object: {} },
    });
    const request = createRequest({
      method: "POST",
      body: "payload",
      headers: { "stripe-signature": "sig" },
    });
    const response = await onRequest(createContext({ request, env: createEnv() }));
    const text = await readText(response);
    expect(response.status).toBe(200);
    expect(text).toBe("Event ignored");
  });
});
