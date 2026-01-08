export default defineNuxtConfig({
<<<<<<< HEAD
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
=======
  extends: ['plugin:vue/vue3-recommended', '@nuxtjs/eslint-config', '@vue/eslint-config-prettier'],
  modules: ['../src/module'],
  devtools: {
    enabled: true,
  },
  compatibilityDate: '2024-04-03',
  genQuery: {
    baseURL: 'https://api.example.com',
    cachedPages: 4,
>>>>>>> f1abe72ae98256faf24d341fc0330f73b12dac70
  },
})
