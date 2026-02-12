import type { DiscordSDK, DiscordSDKMock } from "@discord/embedded-app-sdk";

type AuthStatus = 'idle' | 'initializing' | 'authenticating' | 'authenticated' | 'error'

interface DiscordState {
  sdk: DiscordSDK | DiscordSDKMock | null;
  auth: DiscordAuth | null;
  status: AuthStatus;
  error: string | null;
}

export const useDiscordStore = defineStore('discordStore', {
  state: (): DiscordState => {
    return {
      sdk: null,
      auth: null,
      error: null,
      status: 'idle'
    }
  },
  getters: {
    user: (state): DiscordAuth['user'] | null => state.auth?.user || null,
    isAuthenticated: (state): boolean => !!state.auth?.user || state.status == 'authenticated'
  },
  actions: {
    setSdk(sdk: DiscordSDK | DiscordSDKMock) {
      this.sdk = sdk;
      this.status = 'initializing';
    },
    setError(error: string) {
      this.status = 'error';
      this.error = error;
    },
    clearError() {
      this.error = null;
    },
    setStatus(status: AuthStatus) {
      this.status = status
    },
    setAuth(auth: DiscordAuth) {
      this.status = 'authenticated'
      this.auth = auth;
    },
  },
})
