import { DiscordSDK, DiscordSDKMock } from "@discord/embedded-app-sdk";


let sdkInstance: DiscordSDK | DiscordSDKMock | null = null;
export const useDiscordSdk = () => {
  if (sdkInstance) return sdkInstance;

  const config = useRuntimeConfig();
  const clientId = config.public.discordClientId;
  const devMode = config.public.devMode;
  if (!devMode || isDiscordIframe()) {
    sdkInstance = new DiscordSDK(clientId, {
      disableConsoleLogOverride: false
    });
  } else {
    // Development/testing mode - use mock SDK
    sdkInstance = new DiscordSDKMock(config.public.discordClientId, null, null, null);
    console.log("Using mock SDK")
    // patchUrlMappings([{ prefix: '/api', target: 'localhost:3001' }]);
  }

  return sdkInstance;
}

const isDiscordIframe = (): boolean => {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get('frame_id') != null;

}

