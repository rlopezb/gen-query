# gen-query

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A powerful Nuxt module for type-safe API queries using TanStack Query (Vue Query) with generic types.

- [✨ Release Notes](/CHANGELOG.md)
- [📖 Backend API Specification](/BACKEND_API.md)

## Features

- 🔥 **Type-safe** - Full TypeScript support with generics
- 🚀 **TanStack Query** - Built on top of TanStack Query for powerful data fetching
- 🎯 **Composables-first** - Easy-to-use Vue composables
- 📄 **Pagination** - Built-in pagination and filtering support
- 🔄 **Optimistic Updates** - Automatic optimistic UI updates for mutations
- 🔐 **Authentication** - Optional token-based authentication
- 📦 **Lightweight** - Minimal dependencies

## Quick Setup

Install the module to your Nuxt application:

```bash
npx nuxi module add gen-query
```

## Configuration

Configure the base URL for your API in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['gen-query'],
  
  genQuery: {
    baseURL: 'https://api.example.com'
  }
})
```

Alternatively, use an environment variable:

```bash
NUXT_PUBLIC_API_BASE_URL=https://api.example.com
```

## Usage

### Authentication

Use `useLoginService` for user authentication:

```vue
<script setup lang="ts">
import type { Login, User } from 'gen-query'

const loginService = useLoginService('auth')

const credentials: Login = {
  username: 'user@example.com',
  password: 'password123'
}

const { mutate: login, isPending, isError, error } = loginService.login

const handleLogin = () => {
  login(credentials, {
    onSuccess: (user: User) => {
      console.log('Logged in:', user.token)
      // Store token for subsequent requests
    }
  })
}
</script>
```

### Fetching a Single Entity

Use `useSingleQuery` to fetch a single entity by ID:

```vue
<script setup lang="ts">
import type { Entity } from 'gen-query'

interface Product extends Entity<number> {
  name: string
  price: number
  category: string
}

const productId = ref(1)
const token = ref('your-auth-token')

const productQuery = useSingleQuery<Product, number>('products', productId, token)

const { data: product, isLoading, isError } = productQuery.get
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isError">Error loading product</div>
  <div v-else-if="product">
    <h1>{{ product.name }}</h1>
    <p>Price: ${{ product.price }}</p>
  </div>
</template>
```

### Fetching Multiple Entities

Use `useMultipleQuery` for CRUD operations on a collection:

```vue
<script setup lang="ts">
import type { Entity } from 'gen-query'

interface Product extends Entity<number> {
  name: string
  price: number
  category: string
}

const token = ref('your-auth-token')
const productQuery = useMultipleQuery<Product, number>('products', token)

// Fetch all products
const { data: products, isLoading } = productQuery.list

// Create a new product
const { mutate: createProduct } = productQuery.create
const newProduct = { name: 'New Product', price: 99.99, category: 'electronics' }
createProduct(newProduct)

// Update a product
const { mutate: updateProduct } = productQuery.update
updateProduct({ id: 1, name: 'Updated Product', price: 89.99, category: 'electronics' })

// Delete a product
const { mutate: deleteProduct } = productQuery.delete
deleteProduct({ id: 1 })
</script>
```

### Paginated Queries with Filters

Use `usePaginatedQuery` for paginated data with filtering and sorting:

```vue
<script setup lang="ts">
import { Pageable, Filters } from 'gen-query'
import type { Entity } from 'gen-query'

interface Product extends Entity<number> {
  name: string
  price: number
  category: string
  stock: number
}

const token = ref('your-auth-token')

// Configure pagination
const pageable = new Pageable(
  0,  // page number (0-indexed)
  20, // page size
  [{ property: 'name', direction: 'asc' }] // sorting
)

// Configure filters
const filters = ref(new Filters())
filters.value.price = {
  operator: 'and',
  constraints: [
    { matchMode: 'gte', value: 100 },
    { matchMode: 'lte', value: 500 }
  ]
}
filters.value.category = {
  operator: 'and',
  constraints: [{ matchMode: 'eq', value: 'electronics' }]
}

const productQuery = usePaginatedQuery<Product, number>(
  'products',
  pageable,
  filters,
  token
)

const { data: page, isLoading } = productQuery.page

// Access paginated data
const products = computed(() => page.value?.content ?? [])
const totalPages = computed(() => page.value?.page.totalPages ?? 0)
const totalElements = computed(() => page.value?.page.totalElements ?? 0)
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else>
    <div v-for="product in products" :key="product.id">
      <h3>{{ product.name }}</h3>
      <p>Price: ${{ product.price }}</p>
    </div>
    <p>Total: {{ totalElements }} products ({{ totalPages }} pages)</p>
  </div>
</template>
```

### Infinite Scroll

Use the built-in infinite query for infinite scrolling:

```vue
<script setup lang="ts">
import { Pageable, Filters } from 'gen-query'
import type { Entity } from 'gen-query'

interface Product extends Entity<number> {
  name: string
  price: number
}

const token = ref('your-auth-token')
const pageable = new Pageable(0, 20)
const filters = ref(new Filters())

const productQuery = usePaginatedQuery<Product, number>(
  'products',
  pageable,
  filters,
  token
)

const {
  data: infiniteData,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = productQuery.infinite

// Get all products from all pages
const allProducts = computed(() => 
  infiniteData.value?.pages.flatMap(page => page.content) ?? []
)
</script>

<template>
  <div>
    <div v-for="product in allProducts" :key="product.id">
      {{ product.name }}
    </div>
    <button 
      v-if="hasNextPage" 
      @click="fetchNextPage()"
      :disabled="isFetchingNextPage"
    >
      {{ isFetchingNextPage ? 'Loading...' : 'Load More' }}
    </button>
  </div>
</template>
```

## API Reference

### Composables

#### `useLoginService(resource?: string)`

Creates a login service for authentication.

**Parameters:**
- `resource` (optional): API endpoint for login. Default: `'auth'`

**Returns:** Object with `login` mutation

**Example:**
```typescript
const loginService = useLoginService('auth')
const { mutate: login } = loginService.login
```

---

#### `useSingleQuery<T, K>(resource: string, id: Ref<K>, token?: MaybeRefOrGetter<string | undefined>)`

Fetches a single entity by ID.

**Type Parameters:**
- `T`: Entity type extending `Entity<K>`
- `K`: ID type

**Parameters:**
- `resource`: API endpoint (e.g., `'products'`)
- `id`: Reactive reference to entity ID
- `token` (optional): Authentication token

**Returns:** Object with `get` query

---

#### `useMultipleQuery<T, K>(resource: string, token?: MaybeRefOrGetter<string | undefined>)`

Provides CRUD operations for a collection of entities.

**Type Parameters:**
- `T`: Entity type extending `Entity<K>`
- `K`: ID type

**Parameters:**
- `resource`: API endpoint
- `token` (optional): Authentication token

**Returns:** Object with:
- `list`: Query for fetching all entities
- `create`: Mutation for creating entities
- `update`: Mutation for updating entities
- `delete`: Mutation for deleting entities

---

#### `usePaginatedQuery<T, K>(resource: string, pageable: Pageable, filters: Ref<Filters>, token?: MaybeRefOrGetter<string | undefined>)`

Fetches paginated entities with filtering and sorting.

**Type Parameters:**
- `T`: Entity type extending `Entity<K>`
- `K`: ID type

**Parameters:**
- `resource`: API endpoint
- `pageable`: Pagination configuration
- `filters`: Reactive filters
- `token` (optional): Authentication token

**Returns:** Object with:
- `page`: Query for paginated data
- `infinite`: Infinite query for infinite scrolling

---

### Types

#### `Entity<K>`

Base interface for entities with an ID.

```typescript
interface Entity<K> {
  id: K
}
```

#### `Login`

Login credentials.

```typescript
type Login = {
  username: string
  password: string
}
```

#### `User`

User information returned after login.

```typescript
type User = {
  username: string
  password: string
  fullName: string
  email: string
  token: string
}
```

#### `Page<T>`

Paginated response structure.

```typescript
type Page<T> = {
  page: {
    number: number
    size: number
    totalElements: number
    totalPages: number
  }
  content: T[]
}
```

#### `Sort`

Sorting configuration.

```typescript
type Sort = {
  property: string
  direction: 'asc' | 'desc'
}
```

#### `FilterItem`

Filter configuration.

```typescript
type FilterItem = {
  operator: string
  constraints: Constraint[]
}
```

#### `Constraint`

Filter constraint.

```typescript
type Constraint = {
  matchMode: string
  value: unknown
}
```

---

### Classes

#### `Pageable`

Pagination configuration class.

```typescript
class Pageable {
  constructor(
    page: number = 0,
    size: number = 30,
    sort: Sort[] = []
  )
  
  toQueryParams(): string
}
```

**Example:**
```typescript
const pageable = new Pageable(0, 20, [
  { property: 'name', direction: 'asc' }
])
```

#### `Filters`

Filter configuration class.

```typescript
class Filters {
  [key: string]: FilterItem
  
  toQueryParams(): string
}
```

**Example:**
```typescript
const filters = new Filters()
filters.price = {
  operator: 'and',
  constraints: [
    { matchMode: 'gte', value: 100 },
    { matchMode: 'lte', value: 500 }
  ]
}
```

**Available Match Modes:**
- `eq` - Equals
- `ne` - Not equals
- `lt` - Less than
- `lte` - Less than or equal
- `gt` - Greater than
- `gte` - Greater than or equal
- `contains` - Contains substring
- `startsWith` - Starts with
- `endsWith` - Ends with
- `in` - In list

#### `ApiError`

Custom error class for API errors.

```typescript
class ApiError extends Error {
  timestamp: Date
  type: string
  statusCode: number
  status: string
  content?: object
}
```

## Backend API Requirements

Your backend API should follow the specification detailed in [BACKEND_API.md](/BACKEND_API.md).

Key requirements:
- RESTful endpoints with JSON
- Standard CRUD operations
- Pagination endpoint with `/page` suffix
- Filter and sort query parameters
- Consistent error response format

## Development

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>

## License

MIT License - see [LICENSE](LICENSE) for details

## Links

- [NPM Package](https://npmjs.com/package/gen-query)
- [GitHub Repository](https://github.com/rlopezb/gen-query)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/gen-query/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/gen-query

[npm-downloads-src]: https://img.shields.io/npm/dm/gen-query.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/gen-query

[license-src]: https://img.shields.io/npm/l/gen-query.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/gen-query

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
