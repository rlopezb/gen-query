import { defineNuxtModule, createResolver, addImportsDir, installModule } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  baseURL: string
}

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
    nuxt.options.typescript.tsConfig.include = [
      resolver.resolve('./types.d.ts'),
    ]
    await installModule('@hebilicious/vue-query-nuxt')
    addImportsDir(resolver.resolve('runtime/composables'))
  },
})

export { Entity, Login, User, ApiError, Page, Sort, Pageable, Filters, FilterItem, Constraint, LoginService, Service, SingleQuery, MultipleQuery, PaginatedQuery } from './runtime/types'
