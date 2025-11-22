import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { defu } from 'defu'

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
  setup(options, nuxt) {
    nuxt.options.runtimeConfig.public.genQuery = defu(nuxt.options.runtimeConfig.public.genQuery, {
      baseURL: options.baseURL,
    })

    const resolver = createResolver(import.meta.url)

    // Add Vue Query plugin with SSR support
    addPlugin(resolver.resolve('runtime/plugin'))

    // Explicitly import public composables (excluding useQueryFetch which is internal)
    const composables = [
      { name: 'useLoginService', from: resolver.resolve('runtime/composables/useLoginService') },
      { name: 'useSingleQuery', from: resolver.resolve('runtime/composables/useSingleQuery') },
      { name: 'useMultipleQuery', from: resolver.resolve('runtime/composables/useMultipleQuery') },
      { name: 'usePaginatedQuery', from: resolver.resolve('runtime/composables/usePaginatedQuery') },
    ]

    composables.forEach(({ name, from }) => {
      nuxt.hook('imports:extend', (imports) => {
        imports.push({ name, from })
      })
    })
  },
})

export type { Login, User, Entity, Page, FilterItem, Constraint, Sort } from './runtime/types'
export type { Pageable, Filters, ApiError } from './runtime/models'
