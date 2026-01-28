"use client"
import {
  DiscordSDK,
  DiscordSDKMock,
  IDiscordSDK,
  patchUrlMappings,
} from '@discord/embedded-app-sdk';

let discordSdk: DiscordSDK | DiscordSDKMock | null = null;

/**
 * Initialize Discord SDK as a singleton
 * This runs only once, on the client side
 */
export async function initializeDiscordSDK(): Promise<DiscordSDK | DiscordSDKMock> {
  console.debug("Initializing DiscordSDK");
  // Return existing instance if already initialized
  if (discordSdk) {
    return discordSdk;
  }

  const queryParams = new URLSearchParams(window.location.search);
  const isEmbedded = queryParams.get('frame_id') != null;

  console.debug("isEmbedded?", isEmbedded);
  if (isEmbedded) {
    discordSdk = new DiscordSDK(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!, {
      disableConsoleLogOverride: false
    });
  } else {
    // Development/testing mode - use mock SDK
    discordSdk = new DiscordSDKMock(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!, null, null, null);
    console.log("Using mock SDK")
    patchUrlMappings([{ prefix: '/api', target: 'localhost:3001' }]);
  }


  await discordSdk.ready();

  console.debug("DiscordSDK ready.");

  return discordSdk;
}

/**
 * Get the already-initialized Discord SDK instance
 */
export function getDiscordSDK(): IDiscordSDK | null {
  return discordSdk;
}
