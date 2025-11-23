import type { Ref, MaybeRefOrGetter } from 'vue'
import { keepPreviousData, useMutation, useQueryClient, type QueryClient, type UseQueryReturnType, useQuery, useInfiniteQuery, type UseInfiniteQueryReturnType } from '@tanstack/vue-query'
import { Service } from './services'
import { type Filters, Pageable, type ApiError } from './models'
import type { Entity, Page } from './types'

/**
 * Base query class providing common functionality for all queries.
 * Handles the service instance, query client, and common mutations.
 */
export class BaseQuery<T extends Entity<K>, K> {
  protected resource: string
  protected queryClient: QueryClient
  protected service: Service<T, K>
  protected queryKey: unknown[] | undefined

  constructor(resource: string, token?: MaybeRefOrGetter<string | undefined>) {
    this.resource = resource
    this.queryClient = useQueryClient()
    this.service = new Service<T, K>(resource, token)
  }

  protected invalidate = () => this.queryClient.invalidateQueries({ queryKey: this.queryKey })

  /**
   * Creates an optimistic mutation with common error handling and cache invalidation.
   */
  private createOptimisticMutation<TData = T>(
    mutationFn: (data: TData) => Promise<T>,
    updateCache: (old: unknown, data: TData) => unknown,
  ) {
    return useMutation({
      mutationFn,
      onMutate: async (data: TData) => {
        await this.queryClient.cancelQueries({ queryKey: this.queryKey })
        const previousData = this.queryClient.getQueryData(this.queryKey!)
        this.queryClient.setQueryData(this.queryKey!, (old: unknown) => updateCache(old, data))
        return { previousData }
      },
      onError: (_err: ApiError, _data: TData, context: { previousData: unknown } | undefined) => {
        this.queryClient.setQueryData(this.queryKey!, context?.previousData)
      },
      onSettled: () => this.invalidate(),
    })
  }

  /**
   * Mutation to create a new entity with optimistic updates.
   */
  public create = this.createOptimisticMutation(
    (entity: T) => this.service.create(entity),
    (old, newEntity) => Array.isArray(old) ? [...old, newEntity] : old,
  )

  /**
   * Mutation to update an existing entity with optimistic updates.
   */
  public update = this.createOptimisticMutation(
    (entity: T) => this.service.update(entity),
    (old, newEntity) => {
      if (Array.isArray(old)) {
        return old.map((item: T) => item.id === newEntity.id ? newEntity : item)
      }
      if (old && (old as T).id === newEntity.id) return newEntity
      return old
    },
  )

  /**
   * Mutation to delete an entity with optimistic updates.
   */
  public del = this.createOptimisticMutation(
    (entity: T) => this.service.delete(entity),
    (old, deletedEntity) => Array.isArray(old) ? old.filter((item: T) => item.id !== deletedEntity.id) : old,
  )
}

/**
 * Query class for fetching a single entity by ID.
 */
export class SingleQuery<T extends Entity<K>, K> extends BaseQuery<T, K> {
  id: Ref<K>
  public read: UseQueryReturnType<T, ApiError>

  constructor(resource: string, id: Ref<K>, token?: MaybeRefOrGetter<string | undefined>) {
    super(resource, token)
    this.id = id
    this.queryKey = [this.resource, this.id]
    this.read = useQuery({
      queryKey: this.queryKey,
      queryFn: () => this.service.read(this.id.value),
      placeholderData: keepPreviousData,
    })
  }
}

/**
 * Query class for fetching a list of entities.
 */
export class MultipleQuery<T extends Entity<K>, K> extends BaseQuery<T, K> {
  public list: UseQueryReturnType<T[], ApiError>

  constructor(resource: string, token?: MaybeRefOrGetter<string | undefined>) {
    super(resource, token)
    this.queryKey = [this.resource]
    this.list = useQuery({
      queryKey: this.queryKey,
      queryFn: () => this.service.list(),
      placeholderData: keepPreviousData,
    })
  }
}

/**
 * Query class for fetching paginated entities with filters.
 */
export class PaginatedQuery<T extends Entity<K>, K> extends BaseQuery<T, K> {
  pageable: Pageable
  filters: Ref<Filters>
  public page: UseInfiniteQueryReturnType<Page<T>, ApiError>

  constructor(resource: string, pageable: Pageable, filters: Ref<Filters>, token?: MaybeRefOrGetter<string | undefined>) {
    super(resource, token)
    this.pageable = pageable
    this.filters = filters
    this.queryKey = [this.resource, this.pageable, this.filters]
    this.page = useInfiniteQuery({
      initialPageParam: { pageable: this.pageable },
      queryKey: this.queryKey,
      queryFn: ({ pageParam }: { pageParam: { pageable: Pageable } }) => this.service.page(pageParam.pageable, this.filters.value),
      getNextPageParam: (lastPage: Page<T>, _: Page<T>[], lastPageParam: { pageable: Pageable }) => {
        if (lastPage.page.number >= lastPage.page.totalPages - 1) return undefined
        return {
          pageable: new Pageable(
            lastPageParam.pageable.page + 1,
            lastPageParam.pageable.size,
            lastPageParam.pageable.sort,
          ),
        }
      },
      getPreviousPageParam: (firstPage: Page<T>, _: Page<T>[], firstPageParam: { pageable: Pageable }) => {
        if (firstPage.page.number === 0) return undefined
        return {
          pageable: new Pageable(
            firstPageParam.pageable.page - 1,
            firstPageParam.pageable.size,
            firstPageParam.pageable.sort,
          ),
        }
      },
      maxPages: 4,
      placeholderData: keepPreviousData,
    })
  }
}
