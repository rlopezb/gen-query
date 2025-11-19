export type Login = {
  username: string
  password: string
}

export type User = {
  username: string
  password: string
  fullName: string
  email: string
  token: string
}

export type FilterItem = {
  operator: string
  constraints: Constraint[]
}

export type Constraint = {
  matchMode: string
  value: unknown
}

export type Sort = {
  property: string
  direction: 'asc' | 'desc'
}

export type Page<T> = {
  page: {
    number: number
    size: number
    totalElements: number
    totalPages: number
  }
  content: T[]
}

export interface Entity<K> {
  id: K
}
