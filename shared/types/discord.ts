export interface DiscordTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: DiscordAPIUser;
}

export type DiscordAuth = DiscordTokenResponse;

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
