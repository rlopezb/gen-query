import type { FetchOptions } from 'ofetch'
import type { $Fetch } from 'nitropack'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { ApiError } from '../models'

/**
 * Options for the query fetcher.
 */
export interface QueryFetchOptions extends FetchOptions {
  token?: MaybeRefOrGetter<string | undefined>
}

/**
 * Helper function to create ApiError instances.
 * Reduces code duplication across error handlers.
 */
const createApiError = (response?: any, error?: Error): ApiError => {
  return new ApiError(
    response?._data?.message || error?.message || 'Unknown Error',
    response?._data?.type || 'error',
    response?._data?.name || error?.name || 'Error',
    response?._data?.stack || error?.stack,
    response?._data?.statusCode || response?.status || -1,
    response?._data?.status || 'error',
    response?._data?.content || {},
    response?._data?.cause || error?.cause,
  )
}

/**
 * Composable for creating a fetcher with default configuration and error handling.
 * @param options Fetch options including token.
 * @returns A configured $Fetch instance.
 */
export const useQueryFetch = <T>(options?: QueryFetchOptions): $Fetch<T> => {
  const config = useRuntimeConfig().public.genQuery as { baseURL?: string }

  if (!config?.baseURL) {
    throw new Error(
      'gen-query: baseURL is not configured. Please add it to your nuxt.config.ts:\n' +
      'export default defineNuxtConfig({\n' +
      '  genQuery: {\n' +
      '    baseURL: "http://your-api-url"\n' +
      '  }\n' +
      '})'
    )
  }

  const { baseURL } = config

  const headers = computed(() => {
    const headers: Headers = new Headers(options?.headers)
    headers.append('Accept', 'application/json')
    headers.append('Content-Type', 'application/json')
    return headers
  })

  return $fetch.create<T>({
    ...options,
    baseURL,
    headers: headers.value,
    onRequest({ options: fetchOptions }) {
      if (options?.token) {
        const tokenValue = toValue(options.token)
        if (tokenValue) {
          fetchOptions.headers = new Headers(fetchOptions.headers)
          fetchOptions.headers.append('Authorization', `Bearer ${tokenValue}`)
        }
      }
    },
    onResponse: ({ response }) => {
      // Accept all 2xx status codes (200-299)
      if (response.ok) return response._data
      throw createApiError(response)
    },
    onResponseError: ({ response }) => {
      throw createApiError(response)
    },
    onRequestError: ({ error }) => {
      throw createApiError(undefined, error)
    },
  })
}
