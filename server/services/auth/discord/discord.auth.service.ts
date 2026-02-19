const DISCORD_API = 'https://discord.com/api/v10';

export interface DiscordAPIToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface DiscordAPIUser {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  email?: string;
  verified?: boolean;
  locale?: string;
  avatar_decoration_data?: {
    asset: string;
    sku_id: string;
  } | null;
  flags?: number;
  public_flags?: number;
  premium_type?: number;
}

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

