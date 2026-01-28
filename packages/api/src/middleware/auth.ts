import { DiscordAuth } from '@sudoecool/shared';
import { createMiddleware } from 'hono/factory';
import { DiscordAPIUser } from '@/services/auth/discord.auth.service';
import { UserService } from '@/services/user.service';

export type AuthBindings = {
  Variables: {
    userId: string,
    discordId: string,
    user: DiscordAuth['user']
  }
}

/**
 * Bearer token middleware for protected routes
 * Extracts userId from Bearer token validation
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const accessToken = authHeader.replace("Bearer ", '');

  let discordUser: DiscordAPIUser | null;

  try {
    if (process.env.NODE_ENV === 'development') {
      if (accessToken !== 'mock_access_token') {
        return c.json({ error: 'Invalid mock token' }, 403);
      }

      discordUser = {
        discriminator: '0000',
        global_name: 'Mock User',
        avatar: null,
        id: 'mock_discord_id',
        username: 'mock_username'
      };
    } else {
      // Verify token by fetching user info from Discord
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        return c.json({ error: 'Invalid or expired token' }, 401);
      }

      discordUser = await userResponse.json() as DiscordAPIUser;
    }
    const user = await UserService.syncUser({
      discordId: discordUser.id,
      avatar: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null,
      username: discordUser.username
    });
    c.set('userId', user.id)
    c.set('discordId', user.discordId);
    c.set('user', user);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }

  await next();
});
