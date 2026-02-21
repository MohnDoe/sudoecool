export default defineNuxtConfig({
  runtimeConfig: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET
    },
    public: {
      discordClientId: process.env.NUXT_PUBLIC_DISCORD_CLIENT_ID,
      devMode: process.env.NUXT_PUBLIC_DEV_MODE,
    },
    session: {
      maxAge: 60 * 60 * 4,
      cookie: {
        sameSite: 'none',
        secure: true
      },
      password: process.env.NUXT_SESSION_PASSWORD!
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: process.env.NODE_ENV === 'development' && !!process.env.NUXT_PUBLIC_DEV_MODE,
    timeline: {
      enabled: true
    }
  },
  css: ['~/assets/css/main.css', '~/assets/css/elevated.css'],
  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
    // '@nuxthub/core',
    '@nuxt/ui',
    '@nuxt/fonts',
    'nuxt-auth-utils'
  ],
  typescript: {
    typeCheck: true,
  },
  vite: {
    server: {
      allowedHosts: process.env.NEXT_PUBLIC_DEV_MODE ? [".ngrok-free.dev"] : [process.env.NEXT_PUBLIC_DOMAIN!]
    }
  },
  ui: {
    colorMode: false,
  },
  fonts: {
    families: [
      {
        name: "Switzer", provider: 'local',
      },
      {
        name: "Alpino", provider: 'local'
      },
      {
        name: "Outfit", provider: "google", weights: [500, 700, 900]
      }
    ]
  },
  nitro: {
    preset: 'bun'
  },
  ssr: false
})
