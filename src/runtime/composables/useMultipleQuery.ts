import type { Entity } from '../types'
import { MultipleQuery } from '../types'

export const useMultipleQuery = <T extends Entity<K>, K>(resource: string, token?: string) => {
  return new MultipleQuery<T, K>(resource, token)
}
