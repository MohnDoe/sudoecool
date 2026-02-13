export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      discordClientId: process.env.NUXT_PUBLIC_DISCORD_CLIENT_ID
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },
  css: ['~/assets/css/main.css'],
  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxthub/core', '@nuxt/ui'],
  typescript: {
    typeCheck: true,
  },
  vite: {
    server: {
      allowedHosts: ["nonillusional-unfederative-lonna.ngrok-free.dev"]
    }
  },
  hub: {
    db: {
      dialect: "postgresql",
      driver: "neon-http"
    }
  },
  ui: {
    colorMode: false
  }
})
