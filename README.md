# Gen Query

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A powerful Nuxt module that provides type-safe, generic API query management using TanStack Query (Vue Query). Simplify your data fetching with built-in support for CRUD operations, pagination, filtering, and optimistic updates.

## ✨ Features

- 🎯 **Type-Safe Generics** - Full TypeScript support with generic types for entities and IDs
- 🔄 **Optimistic Updates** - Built-in optimistic UI updates for create, update, and delete operations
- 📄 **Pagination Support** - Infinite scroll pagination with customizable page sizes and sorting
- 🔍 **Advanced Filtering** - Flexible filtering system with multiple operators and constraints
- 🚀 **TanStack Query Integration** - Leverages the power of TanStack Query for caching and state management
- 🎨 **PrimeVue Ready** - Includes PrimeVue integration for rapid UI development
- 🔐 **Authentication Support** - Built-in login service with token management
- 📦 **Composables** - Ready-to-use Vue composables for common query patterns
- 🛠️ **Automatic Date Handling** - Converts ISO date strings to Date objects automatically

## 📦 Installation

Install the module in your Nuxt application:

```bash
npx nuxi module add gen-query
```

Or install manually:

```bash
npm install gen-query
# or
yarn add gen-query
# or
pnpm add gen-query
```

## 🚀 Quick Start

### 1. Configure the Module

Add `gen-query` to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['gen-query'],
  genQuery: {
    baseURL: process.env.NUXT_PUBLIC_API_BASE_URL || 'https://api.example.com'
  }
})
```

### 2. Define Your Entity Types

```typescript
// types/product.ts
import type { Entity } from 'gen-query'

export interface Product extends Entity<number> {
  id: number
  name: string
  description: string
  price: number
  createdAt: Date
}
```

### 3. Use Query Classes

#### Single Entity Query

```typescript
// composables/useProductQuery.ts
import { SingleQuery } from 'gen-query'
import type { Product } from '~/types/product'

export const useProductQuery = (id: Ref<number>) => {
  return new SingleQuery<Product, number>('products', id)
}
```

```vue
<script setup lang="ts">
const productId = ref(1)
const productQuery = useProductQuery(productId)

// Access the query result
const { data, isLoading, error } = productQuery.read

// Update the product
const updateProduct = async (product: Product) => {
  await productQuery.update.mutateAsync(product)
}
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else-if="data">
    <h1>{{ data.name }}</h1>
    <p>{{ data.description }}</p>
    <p>Price: ${{ data.price }}</p>
  </div>
</template>
```

#### Multiple Entities Query

```typescript
import { MultipleQuery } from 'gen-query'
import type { Product } from '~/types/product'

export const useProductsQuery = () => {
  return new MultipleQuery<Product, number>('products')
}
```

```vue
<script setup lang="ts">
const productsQuery = useProductsQuery()
const { data: products, isLoading } = productsQuery.list

// Create a new product
const createProduct = async (product: Product) => {
  await productsQuery.create.mutateAsync(product)
}

// Delete a product
const deleteProduct = async (product: Product) => {
  await productsQuery.del.mutateAsync(product)
}
</script>

<template>
  <div v-if="isLoading">Loading products...</div>
  <ul v-else>
    <li v-for="product in products" :key="product.id">
      {{ product.name }} - ${{ product.price }}
      <button @click="deleteProduct(product)">Delete</button>
    </li>
  </ul>
</template>
```

#### Paginated Query with Filters

```typescript
import { PaginatedQuery, Pageable, Filters } from 'gen-query'
import type { Product } from '~/types/product'

export const useProductsPaginatedQuery = () => {
  const pageable = new Pageable(0, 20, [{ property: 'name', direction: 'asc' }])
  const filters = ref(new Filters())
  
  return new PaginatedQuery<Product, number>('products', pageable, filters)
}
```

```vue
<script setup lang="ts">
const productsQuery = useProductsPaginatedQuery()
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = productsQuery.page

// Load more products
const loadMore = () => {
  if (hasNextPage.value) {
    fetchNextPage()
  }
}
</script>

<template>
  <div>
    <div v-for="page in data?.pages" :key="page.page.number">
      <div v-for="product in page.content" :key="product.id">
        {{ product.name }}
      </div>
    </div>
    <button 
      @click="loadMore" 
      :disabled="!hasNextPage || isFetchingNextPage"
    >
      {{ isFetchingNextPage ? 'Loading...' : 'Load More' }}
    </button>
  </div>
</template>
```

## � API Reference

### Query Classes

#### `BaseQuery<T, K>`

Base class providing common CRUD mutations with optimistic updates.

**Properties:**
- `create` - Mutation for creating entities
- `update` - Mutation for updating entities
- `del` - Mutation for deleting entities

#### `SingleQuery<T, K>`

Fetches a single entity by ID.

**Constructor:**
```typescript
new SingleQuery<T, K>(resource: string, id: Ref<K>, token?: MaybeRefOrGetter<string>)
```

**Properties:**
- `read` - Query for fetching the entity

#### `MultipleQuery<T, K>`

Fetches a list of all entities.

**Constructor:**
```typescript
new MultipleQuery<T, K>(resource: string, token?: MaybeRefOrGetter<string>)
```

**Properties:**
- `list` - Query for fetching all entities

#### `PaginatedQuery<T, K>`

Fetches paginated entities with filtering support.

**Constructor:**
```typescript
new PaginatedQuery<T, K>(
  resource: string,
  pageable: Pageable,
  filters: Ref<Filters>,
  token?: MaybeRefOrGetter<string>
)
```

**Properties:**
- `page` - Infinite query for paginated data

### Service Classes

#### `Service<T, K>`

Generic service for CRUD operations.

**Methods:**
- `list()` - Fetch all entities
- `page(pageable, filters)` - Fetch paginated entities
- `create(entity)` - Create a new entity
- `read(id)` - Read an entity by ID
- `update(entity)` - Update an entity
- `delete(entity)` - Delete an entity

#### `LoginService`

Service for user authentication.

**Methods:**
- `login(credentials)` - Authenticate user and return token

### Models

#### `Pageable`

```typescript
class Pageable {
  page: number
  size: number
  sort: Sort[]
  
  constructor(page = 0, size = 30, sort = [])
  toQueryParams(): string
}
```

#### `Filters`

```typescript
class Filters {
  [key: string]: FilterItem
  
  toQueryParams(): string
}
```

#### `ApiError`

Custom error class for API errors with detailed information.

### Composables

The module auto-imports the following composables:

- `useLoginService(resource)` - Login service composable
- `useSingleQuery(resource, id, token?)` - Single entity query
- `useMultipleQuery(resource, token?)` - Multiple entities query
- `usePaginatedQuery(resource, pageable, filters, token?)` - Paginated query
- `useQueryFetch(options?)` - Configured fetch instance

## 🔐 Authentication

```typescript
import { LoginService } from 'gen-query'

const loginService = new LoginService('auth')

const login = async (username: string, password: string) => {
  const user = await loginService.login({ username, password })
  // user.token is available for subsequent requests
  return user
}
```

Pass the token to queries:

```typescript
const token = ref('your-auth-token')
const query = new SingleQuery<Product, number>('products', productId, token)
```

## 🎨 Advanced Filtering

```typescript
const filters = ref(new Filters())

// Add a simple filter
filters.value.name = {
  operator: 'and',
  constraints: [
    { matchMode: 'contains', value: 'laptop' }
  ]
}

// Add multiple constraints
filters.value.price = {
  operator: 'and',
  constraints: [
    { matchMode: 'gte', value: 100 },
    { matchMode: 'lte', value: 1000 }
  ]
}

// Date filtering
filters.value.createdAt = {
  operator: 'and',
  constraints: [
    { matchMode: 'gte', value: new Date('2024-01-01') }
  ]
}
```

## 📝 TypeScript Support

Gen Query is written in TypeScript and provides full type safety:

```typescript
import type { Entity, Page, Pageable, Filters } from 'gen-query'

interface MyEntity extends Entity<string> {
  id: string
  name: string
}

const query = new SingleQuery<MyEntity, string>('my-resource', ref('123'))
// query.read.data is typed as Ref<MyEntity | undefined>
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm run dev:prepare

# Develop with the playground
pnpm run dev

# Build the playground
pnpm run dev:build

# Run ESLint
pnpm run lint

# Run tests
pnpm run test
pnpm run test:watch

# Type checking
pnpm run test:types

# Release new version
pnpm run release
```

## 📄 License

[MIT License](LICENSE) © 2024 Rafael López Benavente

## 🔗 Links

- [📦 NPM Package](https://npmjs.com/package/gen-query)
- [🐙 GitHub Repository](https://github.com/rlopezb/gen-query)
- [📖 TanStack Query Docs](https://tanstack.com/query/latest/docs/vue/overview)
- [🎨 PrimeVue](https://primevue.org/)

---

Made with ❤️ for the Nuxt community

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/gen-query/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/gen-query

[npm-downloads-src]: https://img.shields.io/npm/dm/gen-query.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/gen-query

[license-src]: https://img.shields.io/npm/l/gen-query.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/gen-query

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
