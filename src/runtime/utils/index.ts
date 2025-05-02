import type { $Fetch, NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import type { Ref } from 'vue'
import { keepPreviousData, useMutation, useQueryClient, type QueryClient, type UseQueryReturnType, useQuery, useInfiniteQuery } from '@tanstack/vue-query'
import { useQueryFetch } from '../composables/useQueryFetch'

export type ApiError = {
  timestamp: Date
  statusCode: number
  status: string
  message: string
  content?: object
  cause?: object
}
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

export const formatDate = (date: string | Date): string => {
  if (date instanceof Date) {
    return date.toLocaleDateString('en-CA')
  }
  return new Date(date).toLocaleDateString('en-CA')
}

const isoDateFormat = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+(?:[+-][0-2]\d:[0-5]\d|Z)/
export const isIsoDateString = (value: unknown): boolean =>
  typeof value === 'string' && isoDateFormat.test(value)

export const handleDates = <T>(body: T): T => {
  if (!body || typeof body !== 'object') return body

  for (const key of Object.keys(body)) {
    const value = (body as Record<string, unknown>)[key]
    if (typeof value === 'string' && isIsoDateString(value)) {
      (body as Record<string, unknown>)[key] = new Date(value)
    }
    else if (typeof value === 'object' && value !== null) {
      (body as Record<string, unknown>)[key] = handleDates(value)
    }
  }
  return body
}

export class Pageable {
  page: number
  size: number
  sort: Sort[]

  constructor(page: number = 0, size: number = 30, sort: Sort[] = []) {
    this.page = page
    this.size = size
    this.sort = sort
  }

  public toQueryParams = (): string => [
    `size=${encodeURIComponent(this.size)}`,
    `page=${encodeURIComponent(this.page)}`,
    ...this.sort.map(sort => `sort=${encodeURIComponent(sort.property)},${encodeURIComponent(sort.direction)}`),
  ].join('&')
}

export class Filters {
  [key: string]: FilterItem | (() => string);

  public toQueryParams = (): string => {
    const params: string[] = []
    for (const [field, filterItem] of Object.entries(this)) {
      if (typeof filterItem !== 'function') {
        const constraints = filterItem.constraints.filter(c => c.value)
        if (constraints.length > 1) {
          const conditions = constraints.map(c => `${field}:${c.matchMode}:${c.value}`)
          params.push(`filter=${encodeURIComponent(conditions.join(filterItem.operator === 'and' ? '&' : '|'))}`)
        }
        else if (constraints.length === 1) {
          const constraint = constraints[0]
          const matchMode = constraint.matchMode
          let value = constraint.value
          if (value instanceof Date) {
            value = formatDate(value.toISOString())
          }
          params.push(`filter=${encodeURIComponent(`${field}‚${matchMode}‚${value}`)}`)
        }
      }
    }
    return params.join('&')
  }
}

export class LoginService {
  protected fetch: $Fetch<string, NitroFetchRequest>

  constructor(protected resource: string) {
    this.fetch = useQueryFetch<string>()
  }

  public login = async (login: Login): Promise<User> => {
    const response = await this.fetch.raw<User>(this.resource + '/login', { method: 'POST', body: JSON.stringify(login) })
    return response._data as User
  }
}

export class Service<T, K> {
  protected fetch: $Fetch<T, NitroFetchRequest>

  constructor(protected resource: string, token?: string) {
    this.fetch = useQueryFetch<T>(token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
  }

  private call = async <T>(request: NitroFetchRequest, opts?: NitroFetchOptions<NitroFetchRequest>): Promise<T> => {
    const response = await this.fetch.raw<T>(request, opts)
    return handleDates(response._data as T) as T
  }

  public list = (): Promise<T[]> => {
    return this.call<T[]>(this.resource, { method: 'GET' })
  }

  public page = (pageable: Pageable, filters: Filters): Promise<Page<T>> => {
    const query = [
      pageable.toQueryParams(),
      filters.toQueryParams(),
    ].filter(Boolean).join('&')
    return this.call<Page<T>>(`${this.resource}/page?${query}`, { method: 'GET' })
  }

  public create = (entity: T): Promise<T> => {
    return this.call<T>(this.resource, { method: 'POST', body: JSON.stringify(entity) })
  }

  public read = (id: K): Promise<T> => {
    return this.call<T>(`${this.resource}/${id}`, { method: 'GET' })
  }

  public update = (entity: T): Promise<T> => {
    return this.call<T>(this.resource, { method: 'PUT', body: JSON.stringify(entity) })
  }

  public delete = (entity: T): Promise<T> => {
    return this.call<T>(this.resource, { method: 'DELETE', body: JSON.stringify(entity) })
  }
}

class BaseQuery<T extends Entity<K>, K> {
  protected resource: string
  protected queryClient: QueryClient
  protected service: Service<T, K>
  protected queryKey: unknown[] | undefined

  constructor(resource: string, token?: string) {
    this.resource = resource
    this.queryClient = useQueryClient()
    this.service = new Service<T, K>(resource, token)
  }

  protected invalidate = () => this.queryClient.invalidateQueries({ queryKey: this.queryKey })

  public create = useMutation({
    mutationFn: (entity: T) => this.service.create(entity),
    onSuccess: this.invalidate,
  })

  public update = useMutation({
    mutationFn: (entity: T) => this.service.update(entity),
    onSuccess: this.invalidate,
  })

  public del = useMutation({
    mutationFn: (entity: T) => this.service.delete(entity),
    onSuccess: this.invalidate,
  })
}

export class LoginQuery {
  protected loginService: LoginService
  public read: UseQueryReturnType<User, Error>

  constructor(protected login: Ref<Login | null>) {
    this.login = login
    this.loginService = new LoginService('login')
    this.read = useQuery({
      queryKey: ['login', this.login],
      queryFn: async () => await this.loginService.login(this.login.value!),
      enabled: this.login.value !== null,
    })
  }
}

export class SingleQuery<T extends Entity<K>, K> extends BaseQuery<T, K> {
  id: Ref<K>
  public read: UseQueryReturnType<T, ApiError>
  constructor(resource: string, id: Ref<K>, token?: string) {
    super(resource, token)
    this.id = id
    this.queryKey = [this.resource, this.id]
    this.read = useQuery({
      queryKey: this.queryKey,
      queryFn: async () => await this.service.read(this.id.value),
      placeholderData: keepPreviousData,
    })
  }
}

export class MultipleQuery<T extends Entity<K>, K> extends BaseQuery<T, K> {
  public list: UseQueryReturnType<T[], ApiError>
  constructor(resource: string, token?: string) {
    super(resource, token)
    this.queryKey = [this.resource]
    this.list = useQuery({
      queryKey: this.queryKey,
      queryFn: async () => await this.service.list(),
      placeholderData: keepPreviousData,
    })
  }
}

export class PaginatedQuery<T extends Entity<K>, K> extends BaseQuery<T, K> {
  pageable: Pageable
  filters: Ref<Filters>
  public page
  constructor(resource: string, pageable: Pageable, filters: Ref<Filters>, token?: string) {
    super(resource, token)
    this.pageable = pageable
    this.filters = filters
    this.queryKey = [this.resource, this.pageable, this.filters]
    this.page = useInfiniteQuery({
      initialPageParam: { pageable: this.pageable },
      queryKey: this.queryKey,
      queryFn: async ({ pageParam }) => this.service.page(pageParam.pageable, this.filters.value),
      getNextPageParam: (lastPage, _, lastPageParam) => {
        if (lastPage!.page.number === lastPage!.page.totalPages - 1) {
          return undefined
        }
        else {
          const nextPageable = new Pageable()
          nextPageable.page = lastPageParam.pageable.page + 1
          nextPageable.size = lastPageParam.pageable.size
          nextPageable.sort = lastPageParam.pageable.sort
          return { pageable: nextPageable }
        }
      },
      getPreviousPageParam: (firstPage, _, firstPageParam) => {
        if (firstPage!.page.number === 0) {
          return undefined
        }
        else {
          const nextPageable = new Pageable()
          nextPageable.page = firstPageParam.pageable.page - 1
          nextPageable.size = firstPageParam.pageable.size
          nextPageable.sort = firstPageParam.pageable.sort
          return { pageable: nextPageable }
        }
      },
      maxPages: 4,
      placeholderData: keepPreviousData,
    })
  }
}
