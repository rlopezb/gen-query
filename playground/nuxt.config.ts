import Nora from '@primeuix/themes/nora'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@primevue/nuxt-module',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  devtools: { enabled: true },
  css: [
    'assets/styles/main.scss',
    'primeicons/primeicons.css',
    'primeflex/primeflex.css',
  ],
  compatibilityDate: '2025-03-28',
  genQuery: {
    baseURL: 'http://localhost:8080',
  },
  piniaPluginPersistedstate: {
    storage: 'sessionStorage',
  },
  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: Nora,
      },
    },
  },
})
