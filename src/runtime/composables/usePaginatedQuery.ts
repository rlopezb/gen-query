import type { Ref } from 'vue'
import { PaginatedQuery } from '../types'
import type { Entity, Pageable, Filters } from '../types'

export const usePaginatedQuery = <T extends Entity<K>, K>(resource: string, pageable: Pageable, filters: Ref<Filters>, token?: string) => {
  return new PaginatedQuery<T, K>(resource, pageable, filters, token)
}
