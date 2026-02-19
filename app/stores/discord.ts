import type { DiscordSDK, DiscordSDKMock } from "@discord/embedded-app-sdk";

type AuthStatus = 'idle' | 'initializing' | 'authenticating' | 'authenticated' | 'error'

interface DiscordState {
  sdkReady: boolean;
  sdkAuthenticated: boolean;
  loading: boolean;

  error: Error | null;
}

const initialState: DiscordState = {
  sdkAuthenticated: false,
  loading: false,
  sdkReady: false,
  error: null,
}

export const useDiscordStore = defineStore('discordStore', {
  state: (): DiscordState => initialState,
  getters: {
    isFullyReady: (state) => state.sdkReady && state.sdkAuthenticated && !state.loading,
    hasError: (state) => state.error != null
  },
  actions: {
    setReady(val: boolean) {
      this.sdkReady = val
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
    setError(err: Error) {
      this.error = err;
      this.loading = false
      console.error("Discord SDK Error", err)
    },
    async setSdkAuthenticated(sdk: DiscordSDK | DiscordSDKMock, access_token?: string) {
      this.loading = true;
      try {
        if (access_token) {
          await sdk.commands.authenticate({ access_token });
        }

        this.sdkAuthenticated = true;
      } catch (err) {
        this.setError(err as Error);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.$reset()
    }

  },
})
