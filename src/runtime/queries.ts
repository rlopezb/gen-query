import type { Ref, MaybeRefOrGetter } from 'vue'
import { keepPreviousData, useMutation, useQueryClient, type QueryClient, type UseQueryReturnType, useQuery, useInfiniteQuery } from '@tanstack/vue-query'
import { Service } from './services'
import { Filters, Pageable, type ApiError } from './models'
import type { Entity } from './types'

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
            queryFn: async ({ pageParam }) => await this.service.page(pageParam.pageable, this.filters.value),
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
