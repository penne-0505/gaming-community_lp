export interface DiscordUser {
  id: string;
  name: string;
  discriminator?: string | null;
  avatar?: string | null;
}

/** Raw shape from Discord API or session payloads before normalization. */
export interface DiscordUserInput {
  id?: string | null;
  username?: string | null;
  name?: string | null;
  discriminator?: string | null;
  avatar?: string | null;
}

export function parseDiscordUser(input: DiscordUserInput | null | undefined): DiscordUser | null {
  if (!input?.id) return null;
  const name = input.name ?? input.username;
  if (!name) return null;
  return {
    id: String(input.id),
    name: String(name),
    discriminator: input.discriminator ?? null,
    avatar: input.avatar ?? null,
  };
}
