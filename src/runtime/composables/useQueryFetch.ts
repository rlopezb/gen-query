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
 * Composable for creating a fetcher with default configuration and error handling.
 * @param options Fetch options including token.
 * @returns A configured $Fetch instance.
 */
export const useQueryFetch = <T>(options?: QueryFetchOptions): $Fetch<T> => {
  const { baseURL } = useRuntimeConfig().public.genQuery as { baseURL: string }

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
      if (response.status === 200) return response._data
      throw new ApiError(
        response._data?.message || 'Unknown Error',
        response._data?.type || 'error',
        response._data?.name || 'Error',
        response._data?.stack,
        response._data?.statusCode || response.status,
        response._data?.status || 'error',
        response._data?.content || {},
        response._data?.cause,
      )
    },
    onResponseError: ({ response }) => {
      throw new ApiError(
        response._data?.message || 'Unknown Error',
        response._data?.type || 'error',
        response._data?.name || 'Error',
        response._data?.stack,
        response._data?.statusCode || response.status,
        response._data?.status || 'error',
        response._data?.content || {},
        response._data?.cause,
      )
    },
    onRequestError: ({ error }) => {
      throw new ApiError(
        error.message,
        'error.type',
        error.name,
        error.stack,
        -1,
        'error.status',
        {},
        error.cause,
      )
    },
  })
}
