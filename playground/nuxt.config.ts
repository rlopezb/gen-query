export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  ssr: true,
  devtools: {
    enabled: true,
  },
  modules: [
    '../src/module',
  ],
  runtimeConfig: {
    public: {
      genQuery: {
        baseURL: 'https://oracloud.mooo.com:8443',
      },
    },
  },
})
