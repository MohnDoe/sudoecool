import { exchangeCodeForToken, fetchDiscordUser, refreshAccessToken } from '@/services/auth/discord.auth.service';
import { UserService } from '@/services/user.service';
import { Hono } from 'hono';

const DISCORD_API = 'https://discord.com/api/v10';

export const createDiscordAuthRouter = () => {
  const router = new Hono();

  /**
   * POST /auth/discord/token
   * Discord Activity SDK calls this endpoint with the authorization code
   * This is the main endpoint your iframe will use
   * 
   * Flow:
   * 1. Frontend calls discordSdk.commands.authorize() in Discord
   * 2. Gets authorization code back
   * 3. POSTs code to this endpoint
   * 4. Backend exchanges code for Discord access token
   * 5. Returns access token to frontend
   * 6. Frontend authenticates with returned token
   */
  router.post('/token', async (c) => {
    try {
      const { code } = await c.req.json<{ code: string }>();

      if (!code) {
        return c.json({ error: 'Authorization code required' }, 400);
      }

      // Exchange code for token with Discord
      const tokenData = await exchangeCodeForToken(code);

      // Fetch user info
      const discordUser = await fetchDiscordUser(tokenData.access_token);

      // Sync/create user in database
      const user = await UserService.syncUser({
        discordId: discordUser.id,
        avatar: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : null,
        username: discordUser.username
      });

      // Return access token and user info
      //
      const response = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        user,
      }

      return c.json(response);
    } catch (error) {
      console.error('Token endpoint error:', error);
      return c.json(
        {
          error: 'Failed to exchange code for token',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  });

  /**
   * POST /auth/discord/refresh
   * Refresh access token using refresh token
   */
  router.post('/refresh', async (c) => {
    try {
      const { refresh_token } = await c.req.json<{ refresh_token: string }>();

      if (!refresh_token) {
        return c.json({ error: 'Refresh token required' }, 400);
      }

      const newTokenData = await refreshAccessToken(refresh_token);

      return c.json({
        access_token: newTokenData.access_token,
        refresh_token: newTokenData.refresh_token,
        expires_in: newTokenData.expires_in,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return c.json({ error: 'Failed to refresh token' }, 401);
    }
  });

  /**
   * GET /me
   * Get current authenticated user from access token (Bearer token)
   * Called from frontend to verify authentication status
   */
  // router.get('/me', async (c) => {
  //   try {
  //     const authHeader = c.req.header('Authorization');
  //
  //     if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //       return c.json({ error: 'Missing or invalid authorization header' }, 401);
  //     }
  //
  //     const accessToken = authHeader.slice(7);
  //
  //     // Validate token with Discord
  //     const discordUser = await fetchDiscordUser(accessToken);
  //
  //     // Get user from database
  //     const user = await db
  //       .select()
  //       .from(users)
  //       .where(eq(users.discordId, discordUser.id))
  //       .limit(1);
  //
  //     if (user.length === 0) {
  //       return c.json({ error: 'User not found in database' }, 404);
  //     }
  //
  //     return c.json({
  //       id: discordUser.id,
  //       userId: user.id,
  //       username: discordUser.global_name || discordUser.username,
  //       avatar: discordUser.avatar
  //         ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
  //         : null,
  //       discriminator: discordUser.discriminator,
  //       email: discordUser.email,
  //     });
  //   } catch (error) {
  //     console.error('Get user error:', error);
  //     return c.json({ error: 'Failed to fetch user info' }, 401);
  //   }
  // });

  /**
   * POST /auth/discord/logout
   * Revoke refresh token (optional but recommended)
   */
  router.post('/logout', async (c) => {
    try {
      const { refresh_token } = await c.req.json<{ refresh_token: string }>();

      if (refresh_token) {
        // Revoke the token with Discord
        await fetch(`${DISCORD_API}/oauth2/token/revoke`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID!,
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            token: refresh_token,
          }),
        }).catch(() => {
          // Ignore revocation errors
        });
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('Logout error:', error);
      return c.json({ error: 'Logout failed' }, 500);
    }
  });

  return router;
};
