import { VueQueryPlugin, QueryClient, dehydrate, hydrate } from '@tanstack/vue-query'
import { defineNuxtPlugin } from '#app'

/**
 * Nuxt plugin to initialize TanStack Vue Query with SSR support.
 * This plugin replaces @hebilicious/vue-query-nuxt to maintain Nuxt 4 compatibility.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
        refetchOnWindowFocus: false,
      },
    },
  })

  // Install Vue Query plugin
  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient })

  // SSR support: dehydrate state on server
  if (import.meta.server) {
    nuxtApp.hooks.hook('app:rendered', () => {
      nuxtApp.payload.vueQueryState = dehydrate(queryClient)
    })
  }

  // SSR support: hydrate state on client
  if (import.meta.client) {
    nuxtApp.hooks.hook('app:created', () => {
      hydrate(queryClient, nuxtApp.payload.vueQueryState)
    })
  }
})
