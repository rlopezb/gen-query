import type { $Fetch, NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import type { MaybeRefOrGetter } from 'vue'
import { useQueryFetch } from './composables/useQueryFetch'
import type { Pageable, Filters } from './models'
import { handleDates } from './models'
import type { Login, User, Page } from './types'

/**
 * Service for handling user authentication.
 */
export class LoginService {
  protected fetch: $Fetch<string>

  /**
   * @param resource The resource endpoint for login.
   */
  constructor(protected resource: string) {
    this.fetch = useQueryFetch<string>()
  }

  /**
   * Performs a login request.
   * @param login The login credentials.
   * @returns The logged-in user.
   */
  public login = async (login: Login): Promise<User> => {
    const response = await this.fetch.raw<User>(this.resource + '/login', { method: 'POST', body: JSON.stringify(login) })
    return response._data as User
  }
}

/**
 * Generic service for handling CRUD operations on entities.
 * @template T The entity type.
 * @template K The type of the entity's ID.
 */
export class Service<T, K> {
  protected fetch: $Fetch<T>

  /**
   * @param resource The resource endpoint.
   * @param token Optional authentication token.
   */
  constructor(protected resource: string, token?: MaybeRefOrGetter<string | undefined>) {
    this.fetch = useQueryFetch<T>({ token })
  }

  private call = async <T>(request: NitroFetchRequest, opts?: NitroFetchOptions<NitroFetchRequest>): Promise<T> => {
    const response = await this.fetch.raw<T>(request, opts)
    return handleDates(response._data as T) as T
  }

  /**
   * Fetches a list of all entities.
   * @returns A list of entities.
   */
  public list = (): Promise<T[]> => {
    return this.call<T[]>(this.resource, { method: 'GET' })
  }

  /**
   * Fetches a paginated list of entities with filters.
   * @param pageable Pagination configuration.
   * @param filters Filters to apply.
   * @returns A page of entities.
   */
  public page = (pageable: Pageable, filters: Filters): Promise<Page<T>> => {
    const query = [
      pageable.toQueryParams(),
      filters.toQueryParams(),
    ].filter(Boolean).join('&')
    return this.call<Page<T>>(`${this.resource}/page?${query}`, { method: 'GET' })
  }

  /**
   * Creates a new entity.
   * @param entity The entity to create.
   * @returns The created entity.
   */
  public create = (entity: T): Promise<T> => {
    return this.call<T>(this.resource, { method: 'POST', body: JSON.stringify(entity) })
  }

  /**
   * Reads an entity by ID.
   * @param id The ID of the entity.
   * @returns The requested entity.
   */
  public read = (id: K): Promise<T> => {
    return this.call<T>(`${this.resource}/${id}`, { method: 'GET' })
  }

  /**
   * Updates an existing entity.
   * @param entity The entity to update.
   * @returns The updated entity.
   */
  public update = (entity: T): Promise<T> => {
    return this.call<T>(this.resource, { method: 'PUT', body: JSON.stringify(entity) })
  }

  /**
   * Deletes an entity.
   * @param entity The entity to delete.
   * @returns The deleted entity.
   */
  public delete = (entity: T): Promise<T> => {
    return this.call<T>(this.resource, { method: 'DELETE', body: JSON.stringify(entity) })
  }
}
