import type { DiscordUser } from "../types/discord";

export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";

export const DEMO_SITE = {
  name: "Clover Support Demo",
  shortName: "Clover Support",
  description:
    "Minecraft向けコミュニティ支援フローを題材にしたポートフォリオ用デモです。実際の取引、契約、ロール付与、公式提携は行いません。",
  baseUrl: import.meta.env.VITE_APP_BASE_URL || "",
};

export const MINECRAFT_DISCLAIMER =
  "NOT AN OFFICIAL MINECRAFT WEBSITE. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.";

export const DEMO_NOTICE =
  "このサイトはポートフォリオ用サンプルです。実際の決済、契約、Discordロール付与、ゲーム内特典提供は行いません。";

export const DEMO_USER: DiscordUser = {
  id: "demo_user",
  name: "Demo Supporter",
  discriminator: "0000",
  avatar: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f464.svg",
};

export const DEMO_DISCORD_INVITE_URL = "https://discord.com/channels/@me";

export const DEMO_SUPPORTERS = [
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
];
