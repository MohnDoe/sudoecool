'use client';

import { useEffect, useState } from 'react';
import { initializeDiscordSDK } from '@/lib/discordSdk';
import { DiscordSDKMock, Types } from '@discord/embedded-app-sdk';
import { DiscordAuth, DiscordTokenResponse } from '@sudoecool/shared';
import { authStore } from '@/stores/authStore';

export function useDiscordSDK() {
  const { setAuth } = authStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const initializeAuth = async () => {
      console.debug("Initializing auth.");
      try {
        const discordSdk = await initializeDiscordSDK();
        // Authorize with Discord Client
        const { code } = await discordSdk.commands.authorize({
          client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
          response_type: 'code',
          state: '',
          prompt: 'none',
          // More info on scopes here: https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
          scope: [
            // Activities will launch through app commands and interactions of user-installable apps.
            // https://discord.com/developers/docs/tutorials/developing-a-user-installable-app#configuring-default-install-settings-adding-default-install-settings
            'applications.commands',

            // "applications.builds.upload",
            // "applications.builds.read",
            // "applications.store.update",
            // "applications.entitlements",
            // "bot",
            'identify',
            // "connections",
            // "email",
            // "gdm.join",
            'guilds',
            // "guilds.join",
            'guilds.members.read',
            // "messages.read",
            // "relationships.read",
            'rpc.activities.write',
            // "rpc.notifications.read",
            // 'rpc.voice.write',
            // 'rpc.voice.read',
            // "webhook.incoming",
            // discordSdk.guildId == null ? 'dm_channels.read' : null, // This scope requires approval from Discord.
          ].filter((scope) => scope != null) as Types.OAuthScopes[],
        });

        if (discordSdk instanceof DiscordSDKMock) {
          console.log("Using mock auth")
          const mockData: DiscordAuth = {
            user: {
              avatar: null,
              discordId: 'mock_discord_id',
              userId: 'mock_user_id',
              username: 'mock_username'
            },
            access_token: 'mock_access_token',
            expires_in: 10000000,
            refresh_token: 'mock_refresh_token'
          }

          setAuth(mockData);

          // await discordSdk.commands.authenticate({
          //   access_token: 'mock_access_token'
          // })
        } else {
          const tokenResponse = await fetch('/api/auth/discord/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
            }),
          });
          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error(`Error fetching token`, errorData)
            throw new Error(errorData.details || 'Failed to exchange code for token');
          }
          const tokenData: DiscordTokenResponse = await tokenResponse.json();
          setAuth(tokenData as DiscordAuth);

          // Authenticate with Discord SDK
          await discordSdk.commands.authenticate({
            access_token: tokenData.access_token,
          });
        }


      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Discord SDK initialization failed PROUT:', message, err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setAuth]);

  return { loading, error };
}
