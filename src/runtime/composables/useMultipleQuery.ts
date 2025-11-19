import type { MaybeRefOrGetter } from 'vue'
import { MultipleQuery } from '../queries'
import type { Entity } from '../types'

export const useMultipleQuery = <T extends Entity<K>, K>(resource: string, token?: MaybeRefOrGetter<string | undefined>) => {
  return new MultipleQuery<T, K>(resource, token)
}
