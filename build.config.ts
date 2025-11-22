import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  externals: [
    'defu',
    '@nuxt/kit',
    '@nuxt/schema',
    '@tanstack/vue-query',
  ],
})
