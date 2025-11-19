import type { $Fetch, NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { useQueryFetch } from './composables/useQueryFetch'
import type { Pageable, Filters } from './models'
import { handleDates } from './models'
import type { Login, User, Page } from './types'

export class LoginService {
  protected fetch: $Fetch<string>

  constructor(protected resource: string) {
    this.fetch = useQueryFetch<string>()
  }

  public login = async (login: Login): Promise<User> => {
    const response = await this.fetch.raw<User>(this.resource + '/login', { method: 'POST', body: JSON.stringify(login) })
    return response._data as User
  }
}

export class Service<T, K> {
  protected fetch: $Fetch<T>

  constructor(protected resource: string, token?: MaybeRefOrGetter<string | undefined>) {
    this.fetch = useQueryFetch<T>(token
      ? {
        headers: {
          Authorization: `Bearer ${toValue(token)}`,
        },
        token,
      }
      : undefined)
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
