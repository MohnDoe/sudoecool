import { z } from "zod/v4";
import { exchangeCodeForToken, fetchDiscordGuildMember, fetchDiscordUser } from "~~/server/services/auth/discord/discord.auth.service";
import { UserService } from "~~/server/services/user.service";
import type { DiscordTypes, DiscordAPIToken, DiscordAPIUser } from "~~/shared/types/discord";

const bodySchema = z.object({
  code: z.string(),
  channelId: z.string().nullable().optional(),
  guildId: z.string().nullable().optional()
})

export default defineEventHandler({
  onRequest: [],
  onBeforeResponse: [],
  handler: async (event) => {
    const config = useRuntimeConfig();

    const body = await readValidatedBody(event, bodySchema.safeParse);
    if (!body.success) {
      // TODO: do not do this. it exposes stack
      throw body.error.issues;
    }

    try {
      const { code, } = body.data;
      let { channelId, guildId } = body.data;

      let tokenData: DiscordAPIToken;
      let discordUser: DiscordAPIUser;
      let guildMember: DiscordTypes.GuildMember | null = null;

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


        guildId = 'discord_mock_guild_id';

        guildMember = {
          user: {
            discriminator: "0001",
            id: "discord_member_mock_id",
            username: "discord_member_mock_username",
            global_name: "discord_member_mock_global_username",
            avatar_decoration_data: null,
            bot: false,
          },
          deaf: false,
          joined_at: Date.now().toString(),
          mute: false,
          roles: []
        }
      } else {
        tokenData = await exchangeCodeForToken(code);
        discordUser = await fetchDiscordUser(tokenData.access_token);

        if (guildId) {
          try {
            guildMember = await fetchDiscordGuildMember(tokenData.access_token, guildId)
          } catch (error) {
            console.warn(error)
          }
        }
      }

      const { user, guildMembership } = await UserService.syncDiscordUser(
        discordUser,
        guildId && guildMember ? {
          member: guildMember as DiscordTypes.GuildMember,
          id: guildId
        } : null);

      await setUserSession(event, {
        user: {
          id: user.id,
          discord: {
            id: user.discordId,
            globalName: discordUser.global_name,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            guildMembership
          }
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
