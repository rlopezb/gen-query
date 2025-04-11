import type { FetchOptions } from 'ofetch'
import type { $Fetch } from 'nitropack'
import { computed } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import type { ApiError } from '../utils'

export const useQueryFetch = <T> (options?: FetchOptions): $Fetch<T> => {
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
      throw {
        timestamp: response._data.timestamp,
        status: response._data.status,
        statusCode: response._data.statusCode,
        message: response._data.message,
        content: response._data.content,
        cause: response._data.cause,
      } as ApiError
    },
  })
}
