import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // Minimal playground without UI components
  modules: [],
  app: {
    baseURL: '/',
  },
  typescript: {
    strict: true,
    shim: false,
  },
})
