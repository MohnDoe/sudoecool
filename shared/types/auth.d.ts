import type { DiscordAPIToken } from "~~/server/services/auth/discord/discord.auth.service";

declare module '#auth-utils' {
  interface User {
    id: string;
    discord: {
      id: string;
      username: string;
      globalName: string | null;
      discriminator: string
    }
  }

  interface UserSession {
    user: User
  }

  interface SecureSessionData {
    discordAccessToken: DiscordAPIToken['access_token']
    discordRefreshToken: DiscordAPIToken['refresh_token']
  }
}

export { }
