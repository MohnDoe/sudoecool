import { type DiscordAPIToken, type DiscordAPIUser, exchangeCodeForToken, fetchDiscordUser } from "~~/server/services/auth/discord/discord.auth.service";
import { UserService } from "~~/server/services/user.service";

export default defineEventHandler({
  onRequest: [],
  onBeforeResponse: [],
  handler: async (event) => {
    const config = useRuntimeConfig();
    try {
      const { code } = await readBody(event);

      console.log(code);

      if (!code) {
        setResponseStatus(event, 400);
        return { error: 'Authorization code required' };
      }

      let tokenData: DiscordAPIToken;
      let discordUser: DiscordAPIUser;

      if (config.public.devMode && code === 'mock_code') {
        console.warn("[/api/auth/discord/token] Using Mock user !")
        discordUser = {
          avatar: null,
          discriminator: "0000",
          global_name: "Mock user",
          id: 'discord_mock_id',
          username: 'discord_mock_username',
        }
        tokenData = {
          access_token: 'discord_mock_access_token',
          expires_in: 100000000,
          refresh_token: 'discord_mock_refresh_token',
          scope: '',
          token_type: ''
        }
      } else {
        // Exchange code for token with Discord
        tokenData = await exchangeCodeForToken(code);
        // Fetch user info
        discordUser = await fetchDiscordUser(tokenData.access_token);
      }

      // Sync/create user in database
      const user = await UserService.syncUser({
        discordId: discordUser.id,
        avatar: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : null,
        username: discordUser.username
      });


      await setUserSession(event, {
        user: {
          id: user.id,
          discordId: user.discordId,
          globalName: discordUser.global_name,
          username: discordUser.username,
          discriminator: discordUser.discriminator
        },
        secure: {
          discordAccessToken: tokenData.access_token,
          discordRefreshToken: tokenData.refresh_token
        }
      })

      setResponseStatus(event, 200)

      // Return access token and user info
      return {
        access_token: tokenData.access_token,
      };
    } catch (error) {
      console.error('Token endpoint error:', error);

      throw createError({
        statusCode: 500,
        message: 'Failed to exchange code for token',
      })


    }
  }
})
