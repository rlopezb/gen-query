export default defineNuxtConfig({
  modules: ['../src/module'],
  ssr: true,
  devtools: {
    enabled: true,
  },
  compatibilityDate: '2024-04-03',
  genQuery: {
    baseURL: 'https://oracloud.mooo.com:8443',
    cachedPages: 4,
  },
})
