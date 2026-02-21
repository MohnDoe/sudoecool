import { DiscordAPIToken, DiscordAPIUser } from "~~/shared/types/discord";

const DISCORD_API = 'https://discord.com/api/v10';

const config = useRuntimeConfig();

/**
 * Exchange Discord authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<DiscordAPIToken> {

  const tokenResponse = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.discord.clientId,
      client_secret: config.discord.clientSecret,
      grant_type: 'authorization_code',
      code,
    }),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    throw new Error(`Discord token exchange failed: ${JSON.stringify(errorData)}`);
  }

  return tokenResponse.json() as Promise<DiscordAPIToken>;
}

/**
 * Fetch user info from Discord API
 */
export async function fetchDiscordUser(accessToken: string): Promise<DiscordAPIUser> {
  const userResponse = await fetch(`${DISCORD_API}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to fetch Discord user info');
  }

  return userResponse.json() as Promise<DiscordAPIUser>;
}

/**
 * Refresh an access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<DiscordAPIToken> {
  const tokenResponse = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.discord.clientId,
      client_secret: config.discord.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error('Token refresh failed');
  }

  return tokenResponse.json() as Promise<DiscordAPIToken>;
}

