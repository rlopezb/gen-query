import type { Ref, MaybeRefOrGetter } from 'vue'
import type { Entity } from '../types'
import { PaginatedQuery } from '../queries'
import type { Filters, Pageable } from '../models'

/**
 * Composable for fetching paginated entities with filters.
 * @param resource The resource endpoint.
 * @param pageable Pageable configuration.
 * @param filters Reactive filters.
 * @param token Optional authentication token.
 */
export const usePaginatedQuery = <T extends Entity<K>, K>(resource: string, pageable: Pageable, filters: Ref<Filters>, token?: MaybeRefOrGetter<string | undefined>) => {
  return new PaginatedQuery<T, K>(resource, pageable, filters, token)
}
