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
  defaults: {
    baseURL: process.env.NUXT_PUBLIC_API_BASE_URL || '',
  },
  async setup(options, nuxt) {
    nuxt.options.runtimeConfig.public.genQuery = {
      baseURL: options.baseURL,
    }
    const resolver = createResolver(import.meta.url)
    await installModule('@hebilicious/vue-query-nuxt')
    addImportsDir(resolver.resolve('runtime/composables'))
  },
})

export type { Login, User, Entity, Page, FilterItem, Constraint, Sort } from './runtime/types'
export type { Pageable, Filters, ApiError } from './runtime/models'
export { Service, LoginService } from './runtime/services'
export { SingleQuery, MultipleQuery, PaginatedQuery, BaseQuery } from './runtime/queries'

