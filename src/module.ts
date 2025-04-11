import { defineNuxtModule, createResolver, addImportsDir, installModule } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  baseURL: string
}

export type * from './runtime/utils'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'gen-query',
    configKey: 'genQuery',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(options, nuxt) {
    nuxt.options.runtimeConfig.public.genQuery = {
      baseURL: options.baseURL,
    }
    const resolver = createResolver(import.meta.url)
    await installModule('@hebilicious/vue-query-nuxt')
    addImportsDir(resolver.resolve('runtime/composables'))
  },
})
