
import { DiscordSDKMock, type Types } from "@discord/embedded-app-sdk";
import type { FetchError } from 'ofetch';

export const useDiscordSDK = () => {
  useNuxtApp();
  const discordStore = useDiscordStore();
  const config = useRuntimeConfig();

  const authenticate = async () => {
    console.debug("Initializing auth.");
    if (!discordStore.sdk) {
      discordStore.setError("Discord SDK not initialized");
      return;
    }
    try {
      discordStore.setLoading(true);
      // Authorize with Discord Client
      const { code } = await discordStore.sdk.commands.authorize({
        client_id: config.public.discordClientId,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: [
          'applications.commands',
          'identify',
          'guilds',
          'guilds.members.read',
          'rpc.activities.write',
        ].filter((scope) => scope != null) as Types.OAuthScopes[],
      });

      if (discordStore.sdk instanceof DiscordSDKMock) {
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

        discordStore.setAuth(mockData);
      } else {
        try {
          const response = await $fetch<DiscordTokenResponse>('/api/auth/discord/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
            }),
          });

          discordStore.setAuth(response);

          await discordStore.sdk.commands.authenticate({
            access_token: response.access_token,
          });
        }
        catch (e) {
          const error = e as FetchError;
          console.error(`Error fetching token`, error)
          throw new Error(error.data || 'Failed to exchange code for token');
        }

      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      discordStore.setError(message);
      console.error('Discord SDK initialization failed PROUT:', message, err);
    } finally {
      discordStore.setLoading(false);
    }
  }


  return {
    authenticate,
    store: discordStore
  }
}
