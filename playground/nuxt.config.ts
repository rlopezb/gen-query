export default defineNuxtConfig({
  ssr: true,
  extends: ['plugin:vue/vue3-recommended', '@nuxtjs/eslint-config', '@vue/eslint-config-prettier'],
  modules: ['../src/module'],
  devtools: {
    enabled: true,
  },
  compatibilityDate: '2024-04-03',
  genQuery: {
    baseURL: 'https://api.example.com',
    cachedPages: 4,
  },
})