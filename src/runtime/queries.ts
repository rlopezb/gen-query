import type { Ref, MaybeRefOrGetter } from 'vue'
import { keepPreviousData, useMutation, useQueryClient, type QueryClient, useQuery, useInfiniteQuery, type UseInfiniteQueryReturnType, type InfiniteData } from '@tanstack/vue-query'
import { Service } from './services'
import { type Filters, Pageable, type ApiError } from './models'
import { UpdateStrategy, type Entity, type Page } from './types'
import { useRuntimeConfig } from '#app'

/**
 * Query class for fetching a single entity by ID.
 */
export class SingleQuery<T extends Entity<K>, K> {
  protected resource: string
  protected queryClient: QueryClient
  protected service: Service<T, K>
  protected id: Ref<K>
  protected queryKey: unknown[]

  public create
  public read
  public update
  public del

  constructor(resource: string, id: Ref<K>, token?: MaybeRefOrGetter<string | undefined>) {
    this.resource = resource
    this.queryClient = useQueryClient()
    this.service = new Service<T, K>(resource, token)
    this.id = id
    this.queryKey = [this.resource, this.id]

    this.create = useMutation({
      mutationFn: (entity: T) => this.service.create(entity),
      onMutate: async (createdEntity: T) => {
        const config = useRuntimeConfig().public.genQuery
        switch (config.update) {
          case UpdateStrategy.None:
            break
          case UpdateStrategy.Invalidate:
            this.queryClient.invalidateQueries({ queryKey: this.queryKey })
            break
          case UpdateStrategy.Optimistic:
            await this.queryClient.cancelQueries({ queryKey: this.queryKey })
            this.queryClient.setQueryData(this.queryKey, createdEntity)
            break
          default:
            break
        }
      },
    })

    this.read = useQuery({
      queryKey: this.queryKey,
      queryFn: () => this.service.read(this.id.value),
      placeholderData: keepPreviousData,
    })

    this.update = useMutation({
      mutationFn: (entity: T) => this.service.update(entity),
      onMutate: async (updatedEntity: T) => {
        const config = useRuntimeConfig().public.genQuery
        switch (config.update) {
          case UpdateStrategy.None:
            break
          case UpdateStrategy.Invalidate:
            this.queryClient.invalidateQueries({ queryKey: this.queryKey })
            break
          case UpdateStrategy.Optimistic:
            await this.queryClient.cancelQueries({ queryKey: this.queryKey })
            this.queryClient.setQueryData(this.queryKey, updatedEntity)
            break
          default:
            break
        }
      },
    })

    this.del = useMutation({
      mutationFn: (entity: T) => this.service.delete(entity),
      onMutate: async () => {
        const config = useRuntimeConfig().public.genQuery
        switch (config.update) {
          case UpdateStrategy.None:
            break
          case UpdateStrategy.Invalidate:
            this.queryClient.invalidateQueries({ queryKey: this.queryKey })
            break
          case UpdateStrategy.Optimistic:
            await this.queryClient.cancelQueries({ queryKey: this.queryKey })
            this.queryClient.clear()
            break
          default:
            break
        }
      },
    })
  }
}

/**
 * Query class for fetching a list of entities.
 */
export class MultipleQuery<T extends Entity<K>, K> {
  protected resource: string
  protected queryClient: QueryClient
  protected service: Service<T, K>
  protected queryKey: unknown[]

  public create
  public read
  public update
  public del

  constructor(resource: string, token?: MaybeRefOrGetter<string | undefined>) {
    this.resource = resource
    this.queryClient = useQueryClient()
    this.service = new Service<T, K>(resource, token)
    this.queryKey = [this.resource]

    this.create = useMutation({
      mutationFn: (entity: T) => this.service.create(entity),
      onMutate: async (createdEntity: T) => {
        const config = useRuntimeConfig().public.genQuery
        switch (config.update) {
          case UpdateStrategy.None:
            break
          case UpdateStrategy.Invalidate:
            this.queryClient.invalidateQueries({ queryKey: this.queryKey })
            break
          case UpdateStrategy.Optimistic: {
            await this.queryClient.cancelQueries({ queryKey: this.queryKey })
            const previousData: T[] | undefined = this.queryClient.getQueryData<T[]>(this.queryKey)
            if (previousData) this.queryClient.setQueryData(this.queryKey, [...previousData, createdEntity])
            break
          }
          default:
            break
        }
      },
    })

    this.read = useQuery({
      queryKey: this.queryKey,
      queryFn: () => this.service.list(),
      placeholderData: keepPreviousData,
    })

    this.update = useMutation({
      mutationFn: (entity: T) => this.service.update(entity),
      onMutate: async (updatedEntity: T) => {
        const config = useRuntimeConfig().public.genQuery
        switch (config.update) {
          case UpdateStrategy.None:
            break
          case UpdateStrategy.Invalidate:
            this.queryClient.invalidateQueries({ queryKey: this.queryKey })
            break
          case UpdateStrategy.Optimistic: {
            await this.queryClient.cancelQueries({ queryKey: this.queryKey })
            const previousData: T[] | undefined = this.queryClient.getQueryData<T[]>(this.queryKey)
            if (previousData) this.queryClient.setQueryData(this.queryKey, previousData.map(e => e.id === updatedEntity.id ? updatedEntity : e))
            break
          }
          default:
            break
        }
      },
    })

    this.del = useMutation({
      mutationFn: (entity: T) => this.service.delete(entity),
      onMutate: async (deletedEntity: T) => {
        const config = useRuntimeConfig().public.genQuery
        switch (config.update) {
          case UpdateStrategy.None:
            break
          case UpdateStrategy.Invalidate:
            this.queryClient.invalidateQueries({ queryKey: this.queryKey })
            break
          case UpdateStrategy.Optimistic: {
            await this.queryClient.cancelQueries({ queryKey: this.queryKey })
            const previousData: T[] | undefined = this.queryClient.getQueryData<T[]>(this.queryKey)
            if (previousData) this.queryClient.setQueryData(this.queryKey, previousData.filter(e => e.id !== deletedEntity.id))
            break
          }
          default:
            break
        }
      },
    })
  }
}

/**
 * Query class for fetching paginated entities with filters.
 */
export class PaginatedQuery<T extends Entity<K>, K> {
  protected pageable: Pageable
  protected filters: Ref<Filters>
  protected resource: string
  protected queryClient: QueryClient
  protected service: Service<T, K>
  protected queryKey: unknown[]

  public create
  public read: UseInfiniteQueryReturnType<Page<T>, ApiError>
  public update
  public del

  constructor(resource: string, pageable: Pageable, filters: Ref<Filters>, token?: MaybeRefOrGetter<string | undefined>) {
    this.resource = resource
    this.queryClient = useQueryClient()
    this.service = new Service<T, K>(resource, token)
    this.pageable = pageable
    this.filters = filters
    this.queryKey = [this.resource, this.pageable, this.filters]

    this.create = useMutation({
      mutationFn: (entity: T) => this.service.create(entity),
      onMutate: async (createdEntity: T) => {
        const config = useRuntimeConfig().public.genQuery
        switch (config.update) {
          case UpdateStrategy.None:
            break
          case UpdateStrategy.Invalidate:
            this.queryClient.invalidateQueries({ queryKey: this.queryKey })
            break
          case UpdateStrategy.Optimistic: {
            await this.queryClient.cancelQueries({ queryKey: this.queryKey })
            const previousData: InfiniteData<Page<T>> | undefined = this.queryClient.getQueryData(this.queryKey)
            if (previousData) this.queryClient.setQueryData(
              this.queryKey,
              {
                ...previousData,
                pages: previousData.pages.map((page: Page<T>, index: number) => index === 0 ? { ...page, content: [createdEntity, ...page.content] } : page),
              },
            )
            break
          }
          default:
            break
        }
      },
    })

    const config = useRuntimeConfig().public.genQuery
    this.read = useInfiniteQuery({
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
      maxPages: config.cachedPages,
      placeholderData: keepPreviousData,
    })

    this.update = useMutation({
      mutationFn: (entity: T) => this.service.update(entity),
      onMutate: async (updatedEntity: T) => {
        const config = useRuntimeConfig().public.genQuery
        switch (config.update) {
          case UpdateStrategy.None:
            break
          case UpdateStrategy.Invalidate:
            this.queryClient.invalidateQueries({ queryKey: this.queryKey })
            break
          case UpdateStrategy.Optimistic: {
            await this.queryClient.cancelQueries({ queryKey: this.queryKey })
            const previousData: InfiniteData<Page<T>> | undefined = this.queryClient.getQueryData(this.queryKey)
            if (previousData) this.queryClient.setQueryData(
              this.queryKey,
              {
                ...previousData,
                pages: previousData.pages.map((page: Page<T>) => ({
                  ...page,
                  content: page.content.map((oldEntity: T) => oldEntity.id === updatedEntity.id ? { ...oldEntity, ...updatedEntity } : oldEntity),
                })),
              },
            )

            break
          }
          default:
            break
        }
      },
    })

    this.del = useMutation({
      mutationFn: (entity: T) => this.service.delete(entity),
      onMutate: async (deletedEntity: T) => {
        const config = useRuntimeConfig().public.genQuery
        switch (config.update) {
          case UpdateStrategy.None:
            break
          case UpdateStrategy.Invalidate:
            this.queryClient.invalidateQueries({ queryKey: this.queryKey })
            break
          case UpdateStrategy.Optimistic: {
            await this.queryClient.cancelQueries({ queryKey: this.queryKey })
            const previousData: InfiniteData<Page<T>> | undefined = this.queryClient.getQueryData(this.queryKey)
            if (previousData) this.queryClient.setQueryData(
              this.queryKey,
              {
                ...previousData,
                pages: previousData.pages.map((page: Page<T>) => ({
                  ...page,
                  content: page.content.filter((oldEntity: T) => oldEntity.id !== deletedEntity.id),
                })),
              },
            )
            break
          }
          default:
            break
        }
      },
    })
  }
}
