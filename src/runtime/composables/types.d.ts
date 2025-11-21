/**
 * Type declarations for Nuxt auto-imported composables.
 * This file ensures TypeScript recognizes Nuxt's auto-imports.
 */

declare module '#app' {
  interface RuntimeConfig {
    public: {
      genQuery: {
        baseURL: string
      }
    }
  }
}

// Declare Nuxt composables that are auto-imported
declare global {
  const useRuntimeConfig: () => import('#app').RuntimeConfig
  const useNuxtApp: () => import('#app').NuxtApp
}

export { }
