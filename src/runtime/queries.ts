import type { Ref, MaybeRefOrGetter } from 'vue'
import { keepPreviousData, useMutation, useQueryClient, type QueryClient, type UseQueryReturnType, useQuery, useInfiniteQuery } from '@tanstack/vue-query'
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
     * Mutation to create a new entity.
     * Performs optimistic updates to the cache.
     */
    public create = useMutation({
        mutationFn: (entity: T) => this.service.create(entity),
        onMutate: async (newEntity: T) => {
            await this.queryClient.cancelQueries({ queryKey: this.queryKey })
            const previousData = this.queryClient.getQueryData(this.queryKey!)
            this.queryClient.setQueryData(this.queryKey!, (old: unknown) => {
                if (Array.isArray(old)) return [...old, newEntity]
                // Handle paginated data structure if necessary, or other shapes
                return old
            })
            return { previousData }
        },
        onError: (_err: ApiError, _newEntity: T, context: { previousData: unknown } | undefined) => {
            this.queryClient.setQueryData(this.queryKey!, context?.previousData)
        },
        onSettled: () => {
            this.invalidate()
        },
    })

    /**
     * Mutation to update an existing entity.
     * Performs optimistic updates to the cache.
     */
    public update = useMutation({
        mutationFn: (entity: T) => this.service.update(entity),
        onMutate: async (newEntity: T) => {
            await this.queryClient.cancelQueries({ queryKey: this.queryKey })
            const previousData = this.queryClient.getQueryData(this.queryKey!)
            this.queryClient.setQueryData(this.queryKey!, (old: unknown) => {
                if (Array.isArray(old)) {
                    return old.map((item: T) => item.id === newEntity.id ? newEntity : item)
                }
                // Handle single entity update if queryKey points to one
                if (old && (old as T).id === newEntity.id) return newEntity
                return old
            })
            return { previousData }
        },
        onError: (_err: ApiError, _newEntity: T, context: { previousData: unknown } | undefined) => {
            this.queryClient.setQueryData(this.queryKey!, context?.previousData)
        },
        onSettled: () => {
            this.invalidate()
        },
    })

    /**
     * Mutation to delete an entity.
     * Performs optimistic updates to the cache.
     */
    public del = useMutation({
        mutationFn: (entity: T) => this.service.delete(entity),
        onMutate: async (deletedEntity: T) => {
            await this.queryClient.cancelQueries({ queryKey: this.queryKey })
            const previousData = this.queryClient.getQueryData(this.queryKey!)
            this.queryClient.setQueryData(this.queryKey!, (old: unknown) => {
                if (Array.isArray(old)) {
                    return old.filter((item: T) => item.id !== deletedEntity.id)
                }
                return old
            })
            return { previousData }
        },
        onError: (_err: ApiError, _newEntity: T, context: { previousData: unknown } | undefined) => {
            this.queryClient.setQueryData(this.queryKey!, context?.previousData)
        },
        onSettled: () => {
            this.invalidate()
        },
    })
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
            queryFn: async () => await this.service.read(this.id.value),
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
            queryFn: async () => await this.service.list(),
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
    public page
    constructor(resource: string, pageable: Pageable, filters: Ref<Filters>, token?: MaybeRefOrGetter<string | undefined>) {
        super(resource, token)
        this.pageable = pageable
        this.filters = filters
        this.queryKey = [this.resource, this.pageable, this.filters]
        this.page = useInfiniteQuery({
            initialPageParam: { pageable: this.pageable },
            queryKey: this.queryKey,
            queryFn: async ({ pageParam }: { pageParam: { pageable: Pageable } }) => await this.service.page(pageParam.pageable, this.filters.value),
            getNextPageParam: (lastPage: Page<T>, _: Page<T>[], lastPageParam: { pageable: Pageable }) => {
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
            getPreviousPageParam: (firstPage: Page<T>, _: Page<T>[], firstPageParam: { pageable: Pageable }) => {
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
