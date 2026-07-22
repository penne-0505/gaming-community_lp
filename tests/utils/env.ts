import type { Env } from "../../functions/types";

const baseEnv: Env = {
  STRIPE_SECRET_KEY: "sk_test_dummy",
  STRIPE_WEBHOOK_SECRET: "whsec_dummy",
  STRIPE_PRICE_ONE_MONTH: "price_one_month",
  STRIPE_PRICE_SUB_MONTHLY: "price_sub_monthly",
  STRIPE_PRICE_SUB_YEARLY: "price_sub_yearly",
  DISCORD_CLIENT_ID: "discord_client_id",
  DISCORD_CLIENT_SECRET: "discord_client_secret",
  DISCORD_REDIRECT_URI: "https://example.com/callback",
  DISCORD_BOT_TOKEN: "discord_bot_token",
  DISCORD_GUILD_ID: "discord_guild_id",
  DISCORD_ROLE_MEMBER_ID: "discord_role_member_id",
  APP_BASE_URL: "https://example.com",
  AUTH_TOKEN_SECRET: "auth_token_secret",
  DEMO_MODE: "false",
  DEBUG_TELEMETRY: "false",
};

export function createEnv(overrides: Partial<Env> = {}): Env {
  return { ...baseEnv, ...overrides };
}
