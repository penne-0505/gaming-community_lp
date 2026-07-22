import { trackEvent, captureError } from "../analytics";
import { DEMO_USER, IS_DEMO_MODE } from "../constants/demo";
import { parseDiscordUser, type DiscordUser, type DiscordUserInput } from "../types/discord";

const STATE_STORAGE_KEY = "discord_oauth_state";
const DISCORD_AUTHORIZE_URL = "https://discord.com/oauth2/authorize";
const DEFAULT_SCOPE = "identify guilds.join";
const DEFAULT_PROMPT = "consent";
const DISCORD_AVATAR_BASE = "https://cdn.discordapp.com/avatars";

interface OAuthStatePayload {
  nonce: string;
  returnTo?: string;
}

export interface BeginDiscordLoginOptions {
  returnTo?: string;
  context?: string;
  state?: string;
  scope?: string;
  prompt?: string;
  redirectUri?: string;
  clientId?: string;
}

export interface BuildAuthorizeUrlOptions {
  returnTo?: string;
  state?: string;
  scope?: string;
  prompt?: string;
  redirectUri?: string;
  clientId?: string;
}

export interface ExchangeDiscordCodeOptions {
  captureResponseError?: boolean;
  errorMessage?: string;
  errorContext?: Record<string, unknown>;
  errorStage?: string;
  persistUser?: boolean;
}

export type ExchangeDiscordCodeResult =
  | { ok: true; user: DiscordUser | null; data: unknown }
  | { ok: false; reason?: string; status?: number; text?: string; error?: unknown };

export function createDiscordOAuthState(returnTo?: string): string {
  if (typeof window === "undefined") return "";

  const nonceBytes = new Uint8Array(16);
  window.crypto.getRandomValues(nonceBytes);
  const nonce = base64UrlEncode(nonceBytes);
  const payload: OAuthStatePayload = { nonce, returnTo };

  storeOAuthNonce(nonce);
  return base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
}

export function consumeDiscordOAuthState(
  state: string | null | undefined
): OAuthStatePayload | null {
  if (typeof window === "undefined" || !state) return null;

  let payload: OAuthStatePayload;
  try {
    const decoded = base64UrlDecode(state);
    payload = JSON.parse(new TextDecoder().decode(decoded)) as OAuthStatePayload;
  } catch {
    return null;
  }

  if (!payload?.nonce) return null;
  const stored = loadOAuthNonce();
  clearOAuthNonce();

  if (!stored || stored !== payload.nonce) return null;
  return payload;
}

/**
 * Kick off Discord OAuth login flow.
 */
export function beginDiscordLogin(
  returnToOverride?: string,
  options: BeginDiscordLoginOptions = {}
): void {
  if (typeof window === "undefined") return;
  const context = options.context;
  const returnTo = resolveReturnTo(returnToOverride || options.returnTo);

  if (IS_DEMO_MODE) {
    const user = persistDiscordUser(DEMO_USER);
    trackEvent("login_demo", {
      provider: "discord",
      ...(context ? { context } : {}),
    });
    if (user) {
      window.location.href = returnTo;
    }
    return;
  }

  const state = options.state || createDiscordOAuthState(returnTo);

  trackEvent("login_start", {
    provider: "discord",
    ...(context ? { context } : {}),
  });

  const authorizeUrl = buildDiscordAuthorizeUrl({
    returnTo,
    state,
    scope: options.scope,
    prompt: options.prompt,
    redirectUri: options.redirectUri,
    clientId: options.clientId,
  });

  window.location.href = authorizeUrl;
}

export function buildDiscordAuthorizeUrl({
  returnTo,
  state,
  scope = DEFAULT_SCOPE,
  prompt = DEFAULT_PROMPT,
  redirectUri,
  clientId,
}: BuildAuthorizeUrlOptions = {}): string {
  const resolvedState = state || createDiscordOAuthState(returnTo || "/membership");
  const resolvedClientId = clientId ?? import.meta.env.VITE_DISCORD_CLIENT_ID ?? "";
  const resolvedRedirectUri = resolveRedirectUri(redirectUri);

  const params = new URLSearchParams({
    client_id: resolvedClientId,
    response_type: "code",
    scope,
    redirect_uri: resolvedRedirectUri,
    prompt,
    state: resolvedState,
  });

  return `${DISCORD_AUTHORIZE_URL}?${params.toString()}`;
}

export function extractDiscordOAuthParams(
  href: string | null | undefined,
  { extraParams = [] }: { extraParams?: string[] } = {}
): { code: string | null; state: string | null; cleanUrl: string | null } {
  if (!href) return { code: null, state: null, cleanUrl: null };
  try {
    const url = new URL(href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const paramsToClear = new Set(["code", "state", ...extraParams]);
    let changed = false;

    paramsToClear.forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    });

    return {
      code,
      state,
      cleanUrl: changed ? url.toString() : null,
    };
  } catch {
    return { code: null, state: null, cleanUrl: null };
  }
}

export async function exchangeDiscordCode(
  code: string | null | undefined,
  {
    captureResponseError = true,
    errorMessage = "OAuth exchange failed",
    errorContext = {},
    errorStage = "oauth_callback",
    persistUser = true,
  }: ExchangeDiscordCodeOptions = {}
): Promise<ExchangeDiscordCodeResult> {
  if (IS_DEMO_MODE) {
    const user = persistUser ? persistDiscordUser(DEMO_USER) : DEMO_USER;
    return { ok: true, user, data: { user, demo: true } };
  }

  if (!code) return { ok: false, reason: "missing_code" };

  try {
    const res = await fetch("/discord-oauth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (captureResponseError) {
        captureError(new Error(errorMessage), {
          ...errorContext,
          text,
          status: res.status,
        });
      }
      return { ok: false, status: res.status, text };
    }

    const data = (await res.json()) as { user?: DiscordUserInput };
    const user = normalizeDiscordUser(data?.user);
    if (user && persistUser) {
      persistDiscordUser(user);
    }

    return { ok: true, user, data };
  } catch (err) {
    captureError(err, { stage: errorStage, ...errorContext });
    return { ok: false, error: err };
  }
}

export function normalizeDiscordUser(
  user: DiscordUserInput | null | undefined
): DiscordUser | null {
  const parsed = parseDiscordUser(user);
  if (!parsed) return null;

  const avatarHash =
    typeof user?.avatar === "string" && !user.avatar.includes("/") ? user.avatar : null;
  if (avatarHash && user?.id) {
    return {
      ...parsed,
      avatar: `${DISCORD_AVATAR_BASE}/${user.id}/${avatarHash}.png`,
    };
  }

  // Already a full URL (or null) from session / demo payloads.
  if (user?.avatar && String(user.avatar).includes("/")) {
    return { ...parsed, avatar: String(user.avatar) };
  }

  return parsed;
}

export function persistDiscordUser(
  user: DiscordUser | DiscordUserInput | null | undefined
): DiscordUser | null {
  const normalized = normalizeDiscordUser(user);
  if (typeof window === "undefined" || !normalized) return null;
  try {
    sessionStorage.setItem("discord_user", JSON.stringify(normalized));
  } catch {
    // ignore storage failure
  }
  return normalized;
}

export function loadDiscordUser(): DiscordUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("discord_user");
    if (!raw) return null;
    return parseDiscordUser(JSON.parse(raw) as DiscordUserInput);
  } catch {
    return null;
  }
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array {
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

function storeOAuthNonce(nonce: string): void {
  try {
    sessionStorage.setItem(STATE_STORAGE_KEY, nonce);
    return;
  } catch {
    // fall through to localStorage
  }

  try {
    localStorage.setItem(STATE_STORAGE_KEY, nonce);
  } catch {
    // ignore
  }
}

function resolveReturnTo(returnToOverride?: string): string {
  if (returnToOverride) return returnToOverride;
  if (typeof window === "undefined") return "/membership";
  const currentPath = `${window.location.pathname}${window.location.search}`;
  return currentPath || "/membership";
}

function resolveRedirectUri(redirectUriOverride?: string): string {
  if (redirectUriOverride) return redirectUriOverride;
  if (typeof window === "undefined") {
    return import.meta.env.VITE_DISCORD_REDIRECT_URI || "";
  }
  const appBaseUrl = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
  return import.meta.env.VITE_DISCORD_REDIRECT_URI || `${appBaseUrl}/auth/callback`;
}

function loadOAuthNonce(): string | null {
  try {
    const value = sessionStorage.getItem(STATE_STORAGE_KEY);
    if (value) return value;
  } catch {
    // ignore
  }

  try {
    return localStorage.getItem(STATE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function clearOAuthNonce(): void {
  try {
    sessionStorage.removeItem(STATE_STORAGE_KEY);
  } catch {
    // ignore
  }

  try {
    localStorage.removeItem(STATE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
