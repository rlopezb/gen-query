/**
 * Type definition for mutation update strategies.
 */
export enum UpdateStrategy {
  None,
  Invalidate,
  Optimistic,
}

/**
 * Type definition for login credentials.
 */
export type Login = {
  username: string
  password: string
}

/**
 * Type definition for a user.
 */
export type User = {
  username: string
  password: string
  fullName: string
  email: string
  token: string
}

/**
 * Type definition for a filter item.
 */
export type FilterItem = {
  operator: string
  constraints: Constraint[]
}

/**
 * Type definition for a filter constraint.
 */
export type Constraint = {
  matchMode: string
  value: unknown
}

/**
 * Type definition for sorting configuration.
 */
export type Sort = {
  property: string
  direction: 'asc' | 'desc'
}

/**
 * Type definition for a page of entities.
 * @template T The type of the entity.
 */
export type Page<T> = {
  page: {
    number: number
    size: number
    totalElements: number
    totalPages: number
  }
  content: T[]
}

/**
 * Interface representing an entity with an ID.
 * @template K The type of the ID.
 */
export interface Entity<K> {
  id: K
}
