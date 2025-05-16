import type { FetchOptions } from 'ofetch'
import type { $Fetch } from 'nitropack'
import { computed } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { ApiError } from '../utils'

export const useQueryFetch = <T>(options?: FetchOptions): $Fetch<T> => {
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
    onResponse: ({ response }) => {
      if (response.status === 200) return response._data
      throw new ApiError(
        response._data.message,
        response._data.status,
        response._data.name,
        response._data.stack,
        response._data.statusCode,
        response._data.status,
        response._data.content,
        response._data.cause)
    },
    onResponseError: ({ response }) => {
      throw new ApiError(
        response._data.message,
        response._data.type,
        response._data.name,
        response._data.stack,
        response._data.statusCode,
        response._data.status,
        response._data.content,
        response._data.cause)
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
        error.cause)
    },
  })
}
