import type { Env } from "./types";

const SESSION_COOKIE_NAME = "clover_session";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7;
const encoder = new TextEncoder();

export async function issueSessionCookie(userId: string, request: Request, env: Env) {
  const secret = env?.AUTH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("AUTH_TOKEN_SECRET not configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(userId),
    iat: now,
    exp: now + getTokenTtlSeconds(env),
  };

  const payloadEncoded = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(payloadEncoded, secret);
  const token = `${payloadEncoded}.${signature}`;

  const cookie = buildCookie(SESSION_COOKIE_NAME, token, {
    maxAge: payload.exp - now,
    request,
  });

  return { token, cookie, payload };
}

export async function requireSession(request: Request, env: Env) {
  const secret = env?.AUTH_TOKEN_SECRET;
  if (!secret) {
    return { ok: false, status: 500, message: "Missing AUTH_TOKEN_SECRET" };
  }

  const token = getCookie(request, SESSION_COOKIE_NAME);
  if (!token) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  const payload = await verifyToken(token, secret);
  if (!payload) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  return { ok: true, userId: payload.sub };
}

function getTokenTtlSeconds(env: Env) {
  const raw = Number(env?.AUTH_TOKEN_TTL_SECONDS);
  if (Number.isFinite(raw) && raw > 0) return Math.floor(raw);
  return DEFAULT_TTL_SECONDS;
}

async function verifyToken(token: string, secret: string) {
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) return null;

  const isValid = await verifySignature(payloadEncoded, signature, secret);
  if (!isValid) return null;

  const payload = parsePayload(payloadEncoded);
  if (!payload?.sub || !payload?.exp) return null;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return null;

  return payload;
}

function parsePayload(encoded: string) {
  try {
    const json = new TextDecoder().decode(base64UrlDecode(encoded));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function sign(data: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

async function verifySignature(data: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return crypto.subtle.verify("HMAC", key, base64UrlDecode(signature), encoder.encode(data));
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  let normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  if (pad) {
    normalized += "=".repeat(4 - pad);
  }
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") || "";
  const parts = header.split(";").map((part) => part.trim());
  for (const part of parts) {
    if (!part) continue;
    const index = part.indexOf("=");
    if (index === -1) continue;
    const key = part.slice(0, index);
    if (key === name) {
      return part.slice(index + 1);
    }
  }
  return null;
}

function buildCookie(
  name: string,
  value: string,
  { maxAge, request }: { maxAge: number; request: Request }
) {
  const secure = new URL(request.url).protocol === "https:";
  const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${maxAge}`];
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}
