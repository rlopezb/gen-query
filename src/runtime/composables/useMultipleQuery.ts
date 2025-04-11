import { MultipleQuery, type Entity } from '../utils'

export const useMultipleQuery = <T extends Entity<K>, K>(resource: string, token?: string) => {
  return new MultipleQuery<T, K>(resource, token)
}
