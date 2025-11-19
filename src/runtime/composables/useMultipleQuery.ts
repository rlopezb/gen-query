import { MultipleQuery } from '../queries'
import type { Entity } from '../types'

export const useMultipleQuery = <T extends Entity<K>, K>(resource: string, token?: string) => {
  return new MultipleQuery<T, K>(resource, token)
}
