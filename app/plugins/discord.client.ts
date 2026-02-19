import type { Types as DiscordSDKTypes } from "@discord/embedded-app-sdk";

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();
  const discordStore = useDiscordStore();
  const discordSdk = useDiscordSdk();
  const { fetch: fetchSession, loggedIn, ready } = useUserSession();

  const init = async () => {

    try {
      await discordSdk.ready();
      discordStore.setReady(true);

      console.log('Discord SDK ready');

      await fetchSession();

      if (loggedIn.value && ready.value) {
        console.log("Existing session found, skipping OAuth flow");
        await discordStore.setSdkAuthenticated(discordSdk);
        return
      }

      discordStore.setLoading(true);

      const { code } = await discordSdk.commands.authorize({
        client_id: config.public.discordClientId,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: config.public.discordScope as DiscordSDKTypes.OAuthScopes[]
      })

      console.log('✅ Got auth code from Discord')

      const { access_token } = await $fetch<{ access_token: string }>(
        '/api/auth/discord/token',
        {
          method: 'POST',
          body: { code },
        }
      )

      console.log('✅ Token exchange successful')

      await fetchSession()

      await discordStore.setSdkAuthenticated(discordSdk, access_token)

    } catch (error) {
      console.error("Discord auth failed:", error);
      discordStore.setError(error as Error)
    } finally {
      discordStore.setLoading(false)
    }

  }

  await init();

  return {
    provide: {
      initDiscordClient: init
    }
  }
});
