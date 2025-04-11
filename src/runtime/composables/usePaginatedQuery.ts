import type { Ref } from 'vue'
import { type Pageable, type Filters, type Entity, PaginatedQuery } from '../utils'

export const usePaginatedQuery = <T extends Entity<K>, K>(resource: string, pageable: Pageable, filters: Ref<Filters>, token?: string) => {
  return new PaginatedQuery<T, K>(resource, pageable, filters, token)
}
