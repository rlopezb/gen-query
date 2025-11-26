import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { defu } from 'defu'
import { UpdateStrategy } from './runtime/types'

// Module options TypeScript interface definition
export interface ModuleOptions {
  baseURL: string
  cachedPages: number
  update: UpdateStrategy
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'gen-query',
    configKey: 'genQuery',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    baseURL: process.env.NUXT_PUBLIC_API_BASE_URL || '',
    cachedPages: 4,
    update: UpdateStrategy.Invalidate,
  },

  setup(options, nuxt) {
    nuxt.options.runtimeConfig.public.genQuery = defu(nuxt.options.runtimeConfig.public.genQuery, {
      baseURL: options.baseURL,
      cachedPages: options.cachedPages,
      update: options.update,
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

export type { Login, User, Entity, Page, FilterItem, Constraint, Sort, UpdateStrategy } from './runtime/types'
export type { Pageable, Filters, ApiError } from './runtime/models'
