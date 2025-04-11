import type { Ref } from 'vue'
import { SingleQuery, type Entity } from '../utils'

export const useSingleQuery = <T extends Entity<K>, K>(resource: string, id: Ref<K>, token?: string) => {
  return new SingleQuery<T, K>(resource, id, token)
}
