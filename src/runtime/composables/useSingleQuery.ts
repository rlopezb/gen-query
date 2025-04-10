import type { Ref } from 'vue'
import type { Entity } from '../types'
import { SingleQuery } from '../types'

export const useSingleQuery = <T extends Entity<K>, K>(resource: string, id: Ref<K>, token?: string) => {
  return new SingleQuery<T, K>(resource, id, token)
}
