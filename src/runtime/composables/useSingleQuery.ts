import type { Ref, MaybeRefOrGetter } from 'vue'
import { SingleQuery } from '../queries'
import type { Entity } from '../types'

/**
 * Composable for fetching a single entity by ID.
 * @param resource The resource endpoint.
 * @param id The ID of the entity.
 * @param token Optional authentication token.
 */
export const useSingleQuery = <T extends Entity<K>, K>(resource: string, id: Ref<K>, token?: MaybeRefOrGetter<string | undefined>) => {
  return new SingleQuery<T, K>(resource, id, token)
}
