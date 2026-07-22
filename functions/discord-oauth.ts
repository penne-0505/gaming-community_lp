import type { Env, PagesHandler } from "./types";
/**
 * Exchange Discord OAuth code server-side and (optionally) add user to guild.
 * Expects POST JSON: { code }
 */
import { trackEvent, captureError } from "./telemetry";
import { issueSessionCookie } from "./auth";
import { getDemoUser, isDemoMode, jsonResponse } from "./demo";

export const onRequest: PagesHandler = async (context) => {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (isDemoMode(env)) {
    trackEvent("discord_oauth_demo_success", {}, env);
    return jsonResponse({ user: getDemoUser(), demo: true });
  }

  const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI,
    DISCORD_GUILD_ID,
    DISCORD_BOT_TOKEN,
  } = env;

  if (
    !DISCORD_CLIENT_ID ||
    !DISCORD_CLIENT_SECRET ||
    !DISCORD_REDIRECT_URI ||
    !DISCORD_GUILD_ID ||
    !DISCORD_BOT_TOKEN
  ) {
    return new Response("Missing Discord env", { status: 500 });
  }

  let code;
  try {
    const body = (await request.json()) as { code?: string };
    code = body.code;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  // 1) Exchange code for token
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    captureError(new Error("Token exchange failed"), { status: tokenRes.status, text }, env);
    return new Response(`Token exchange failed: ${text}`, { status: 400 });
  }

  const tokenJson = (await tokenRes.json()) as { access_token?: string; error?: string };
  const accessToken = tokenJson.access_token;

  // 2) Fetch user info
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userRes.ok) {
    const text = await userRes.text();
    captureError(new Error("User fetch failed"), { status: userRes.status, text }, env);
    return new Response(`User fetch failed: ${text}`, { status: 400 });
  }

  const user = (await userRes.json()) as {
    id: string;
    username: string;
    discriminator?: string;
    avatar?: string | null;
  }; // contains id, username, discriminator, avatar

  // 3) Ensure guild join (guilds.join requires user token + bot token)
  const joinRes = await fetch(
    `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${user.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
      body: JSON.stringify({ access_token: accessToken }),
    }
  );
  if (!joinRes.ok && joinRes.status !== 204 && joinRes.status !== 201) {
    const text = await joinRes.text();
    // 409/400 は既に参加済みなどのケースもあるため警告扱いで返さない
    captureError(new Error("Guild join failed"), { status: joinRes.status, text }, env);
    console.warn("Guild join failed", joinRes.status, text);
  }

  trackEvent("discord_oauth_success", { userId: user.id }, env);

  let sessionCookie;
  try {
    const session = await issueSessionCookie(user.id, request, env);
    sessionCookie = session.cookie;
  } catch (err) {
    captureError(err, { stage: "session_cookie_issue" }, env);
    return new Response("Session issue failed", { status: 500 });
  }

  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  headers.append("Set-Cookie", sessionCookie);

  return new Response(
    JSON.stringify({
      user: {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
      },
    }),
    {
      status: 200,
      headers,
    }
  );
};
