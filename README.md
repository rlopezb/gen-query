# gen-query

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A powerful Nuxt module for type-safe API queries using TanStack Query (Vue Query) with full TypeScript support and automatic cache management.

- [✨ Release Notes](/CHANGELOG.md)
- [📖 Backend API Specification](/BACKEND_API.md)

## Features

- 🔥 **Type-safe** - Full TypeScript support with generics
- 🚀 **TanStack Query** - Built on TanStack Query for powerful data fetching and caching
- 🎯 **Composables-first** - Easy-to-use Vue composables for all operations
- 📄 **Pagination** - Built-in infinite scroll and pagination support
- 🔄 **Smart Caching** - Automatic cache invalidation with configurable update strategies
- 🔐 **Authentication** - Optional token-based authentication
- 🎨 **Flexible Filtering** - Advanced filtering with multiple match modes
- 📦 **Lightweight** - Minimal dependencies

## Quick Setup

Install the module:

```bash
npx nuxi module add gen-query
```

## Configuration

Configure in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['gen-query'],
  
  genQuery: {
    baseURL: 'https://api.example.com',  // API base URL
    cachedPages: 4,                       // Max cached pages for infinite queries
    update: UpdateStrategy.Invalidate     // Cache update strategy
  }
})
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseURL` | `string` | `''` | Base URL for all API requests. Can also be set via `NUXT_PUBLIC_API_BASE_URL` env variable |
| `cachedPages` | `number` | `4` | Maximum number of pages to cache in infinite queries |
| `update` | `UpdateStrategy` | `Invalidate` | Strategy for updating cache after mutations |

### Update Strategies

The module supports three cache update strategies:

- **`UpdateStrategy.None`** - No automatic cache updates. You manage cache manually.
- **`UpdateStrategy.Invalidate`** - Invalidates and refetches affected queries after mutations (recommended).
- **`UpdateStrategy.Optimistic`** - Immediately updates cache optimistically before server confirms.

```typescript
import { UpdateStrategy } from 'gen-query'

export default defineNuxtConfig({
  genQuery: {
    update: UpdateStrategy.Optimistic  // Use optimistic updates
  }
})
```

## Quick Start

```vue
<script setup lang="ts">
import type { Entity } from 'gen-query'

// Define your entity type
interface Product extends Entity<number> {
  name: string
  price: number
}

// Fetch all products
const productQuery = useMultipleQuery<Product, number>('products')
const { data: products, isLoading } = productQuery.read

// Create a new product
const { mutate: createProduct } = productQuery.create
createProduct({ name: 'New Product', price: 99.99 })
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else>
    <div v-for="product in products" :key="product.id">
      {{ product.name }} - ${{ product.price }}
    </div>
  </div>
</template>
```

## Core Concepts

### Composables

gen-query provides four main composables:

1. **`useLoginService`** - Handle user authentication
2. **`useSingleQuery`** - CRUD operations for a single entity by ID
3. **`useMultipleQuery`** - CRUD operations for collections
4. **`usePaginatedQuery`** - Paginated data with filtering and sorting

All composables return TanStack Query objects with reactive properties for data, loading states, errors, and mutation functions.

### Queries vs Mutations

- **Queries** (`read`, `list`, `page`) - Fetch data with automatic caching and background refetching
- **Mutations** (`create`, `update`, `del`) - Modify data with automatic cache updates based on your strategy

## Usage Guide

### Authentication

Use `useLoginService` for user authentication:

```vue
<script setup lang="ts">
import type { Login, User } from 'gen-query'

const loginService = useLoginService('auth')  // 'auth' is the resource endpoint

const credentials: Login = {
  username: 'user@example.com',
  password: 'password123'
}

const { mutate: login, isPending, isError, error, data: user } = loginService.login

const handleLogin = () => {
  login(credentials, {
    onSuccess: (user: User) => {
      console.log('Logged in:', user.token)
      // Store token for subsequent requests
      localStorage.setItem('token', user.token)
    },
    onError: (error) => {
      console.error('Login failed:', error.message)
    }
  })
}
</script>

<template>
  <form @submit.prevent="handleLogin">
    <button type="submit" :disabled="isPending">
      {{ isPending ? 'Logging in...' : 'Login' }}
    </button>
    <div v-if="isError" class="error">{{ error?.message }}</div>
  </form>
</template>
```

### Single Entity Operations

Use `useSingleQuery` to work with a single entity by ID:

```vue
<script setup lang="ts">
import type { Entity } from 'gen-query'

interface Product extends Entity<number> {
  name: string
  price: number
  category: string
  description: string
}

const productId = ref(1)
const token = ref(localStorage.getItem('token') || undefined)

const productQuery = useSingleQuery<Product, number>('products', productId, token)

// Read entity
const { 
  data: product, 
  isLoading, 
  isError, 
  error,
  refetch 
} = productQuery.read

// Create entity
const { mutate: createProduct, isPending: isCreating } = productQuery.create

// Update entity
const { mutate: updateProduct, isPending: isUpdating } = productQuery.update

// Delete entity
const { mutate: deleteProduct, isPending: isDeleting } = productQuery.del

const handleUpdate = () => {
  if (!product.value) return
  
  updateProduct({
    ...product.value,
    price: product.value.price * 0.9  // 10% discount
  }, {
    onSuccess: () => {
      console.log('Product updated!')
    }
  })
}

const handleDelete = () => {
  if (!product.value) return
  
  deleteProduct(product.value, {
    onSuccess: () => {
      console.log('Product deleted!')
      // Navigate away or update UI
    }
  })
}
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isError">Error: {{ error?.message }}</div>
  <div v-else-if="product">
    <h1>{{ product.name }}</h1>
    <p>{{ product.description }}</p>
    <p>Price: ${{ product.price }}</p>
    
    <button @click="handleUpdate" :disabled="isUpdating">
      {{ isUpdating ? 'Updating...' : 'Apply 10% Discount' }}
    </button>
    
    <button @click="handleDelete" :disabled="isDeleting">
      {{ isDeleting ? 'Deleting...' : 'Delete Product' }}
    </button>
  </div>
</template>
```

### Collection Operations

Use `useMultipleQuery` for CRUD operations on collections:

```vue
<script setup lang="ts">
import type { Entity } from 'gen-query'

interface Product extends Entity<number> {
  name: string
  price: number
  category: string
}

const token = ref(localStorage.getItem('token') || undefined)
const productQuery = useMultipleQuery<Product, number>('products', token)

// Fetch all products
const { 
  data: products, 
  isLoading, 
  isError, 
  error,
  isFetching,
  refetch 
} = productQuery.read

// Create mutation
const { mutate: createProduct, isPending: isCreating } = productQuery.create

// Update mutation
const { mutate: updateProduct, isPending: isUpdating } = productQuery.update

// Delete mutation
const { mutate: deleteProduct, isPending: isDeleting } = productQuery.del

const newProduct = ref({ name: '', price: 0, category: '' })

const handleCreate = () => {
  createProduct(newProduct.value, {
    onSuccess: (created) => {
      console.log('Created:', created)
      newProduct.value = { name: '', price: 0, category: '' }
    }
  })
}

const handleUpdate = (product: Product) => {
  updateProduct({
    ...product,
    price: product.price * 1.1  // 10% increase
  })
}

const handleDelete = (product: Product) => {
  if (confirm(`Delete ${product.name}?`)) {
    deleteProduct(product)
  }
}
</script>

<template>
  <div>
    <!-- Create Form -->
    <form @submit.prevent="handleCreate">
      <input v-model="newProduct.name" placeholder="Name" required>
      <input v-model.number="newProduct.price" type="number" placeholder="Price" required>
      <input v-model="newProduct.category" placeholder="Category" required>
      <button type="submit" :disabled="isCreating">
        {{ isCreating ? 'Creating...' : 'Create Product' }}
      </button>
    </form>

    <!-- Product List -->
    <div v-if="isLoading">Loading products...</div>
    <div v-else-if="isError">Error: {{ error?.message }}</div>
    <div v-else>
      <div v-for="product in products" :key="product.id" class="product-card">
        <h3>{{ product.name }}</h3>
        <p>Price: ${{ product.price }}</p>
        <p>Category: {{ product.category }}</p>
        
        <button @click="handleUpdate(product)" :disabled="isUpdating">
          Increase Price 10%
        </button>
        <button @click="handleDelete(product)" :disabled="isDeleting">
          Delete
        </button>
      </div>
      
      <button @click="refetch()" :disabled="isFetching">
        {{ isFetching ? 'Refreshing...' : 'Refresh List' }}
      </button>
    </div>
  </div>
</template>
```

### Paginated Queries with Filtering

Use `usePaginatedQuery` for paginated data with advanced filtering and sorting:

```vue
<script setup lang="ts">
import { Pageable, Filters } from 'gen-query'
import type { Entity } from 'gen-query'

interface Product extends Entity<number> {
  name: string
  price: number
  category: string
  stock: number
  createdAt: Date
}

const token = ref(localStorage.getItem('token') || undefined)

// Configure pagination
const pageable = new Pageable(
  0,   // page number (0-indexed)
  20,  // page size
  [{ property: 'createdAt', direction: 'desc' }]  // sort by newest first
)

// Configure filters
const filters = ref(new Filters())

// Filter by price range
filters.value.price = {
  operator: 'and',
  constraints: [
    { matchMode: 'gte', value: 50 },   // price >= 50
    { matchMode: 'lte', value: 500 }   // price <= 500
  ]
}

// Filter by category
filters.value.category = {
  operator: 'and',
  constraints: [{ matchMode: 'eq', value: 'electronics' }]
}

// Filter by stock availability
filters.value.stock = {
  operator: 'and',
  constraints: [{ matchMode: 'gt', value: 0 }]  // in stock
}

const productQuery = usePaginatedQuery<Product, number>(
  'products',
  pageable,
  filters,
  token
)

const {
  data: infiniteData,
  isLoading,
  isError,
  error,
  fetchNextPage,
  fetchPreviousPage,
  hasNextPage,
  hasPreviousPage,
  isFetchingNextPage,
  isFetchingPreviousPage
} = productQuery.read

// Access paginated data
const firstPage = computed(() => infiniteData.value?.pages[0])
const products = computed(() => firstPage.value?.content ?? [])
const totalPages = computed(() => firstPage.value?.page.totalPages ?? 0)
const totalElements = computed(() => firstPage.value?.page.totalElements ?? 0)
const currentPage = computed(() => firstPage.value?.page.number ?? 0)

// Get all products from all loaded pages (for infinite scroll)
const allProducts = computed(() => 
  infiniteData.value?.pages.flatMap(page => page.content) ?? []
)

// Update filters dynamically
const updatePriceFilter = (min: number, max: number) => {
  filters.value.price = {
    operator: 'and',
    constraints: [
      { matchMode: 'gte', value: min },
      { matchMode: 'lte', value: max }
    ]
  }
}

const updateCategoryFilter = (category: string) => {
  if (category) {
    filters.value.category = {
      operator: 'and',
      constraints: [{ matchMode: 'eq', value: category }]
    }
  } else {
    delete filters.value.category
  }
}

const searchByName = (searchTerm: string) => {
  if (searchTerm) {
    filters.value.name = {
      operator: 'and',
      constraints: [{ matchMode: 'contains', value: searchTerm }]
    }
  } else {
    delete filters.value.name
  }
}
</script>

<template>
  <div>
    <!-- Filters -->
    <div class="filters">
      <input 
        type="text" 
        placeholder="Search by name..." 
        @input="searchByName($event.target.value)"
      >
      
      <select @change="updateCategoryFilter($event.target.value)">
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="accessories">Accessories</option>
        <option value="computers">Computers</option>
      </select>
      
      <div>
        Price: 
        <input type="number" placeholder="Min" @change="updatePriceFilter($event.target.value, 500)">
        -
        <input type="number" placeholder="Max" @change="updatePriceFilter(50, $event.target.value)">
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading">Loading products...</div>
    
    <!-- Error State -->
    <div v-else-if="isError" class="error">
      Error: {{ error?.message }}
    </div>
    
    <!-- Product List -->
    <div v-else>
      <div class="summary">
        Showing {{ products.length }} of {{ totalElements }} products
        (Page {{ currentPage + 1 }} of {{ totalPages }})
      </div>
      
      <div v-for="product in products" :key="product.id" class="product-card">
        <h3>{{ product.name }}</h3>
        <p>Price: ${{ product.price }}</p>
        <p>Category: {{ product.category }}</p>
        <p>Stock: {{ product.stock }}</p>
        <p>Added: {{ new Date(product.createdAt).toLocaleDateString() }}</p>
      </div>
      
      <!-- Pagination Controls -->
      <div class="pagination">
        <button 
          @click="fetchPreviousPage()" 
          :disabled="!hasPreviousPage || isFetchingPreviousPage"
        >
          {{ isFetchingPreviousPage ? 'Loading...' : 'Previous Page' }}
        </button>
        
        <button 
          @click="fetchNextPage()" 
          :disabled="!hasNextPage || isFetchingNextPage"
        >
          {{ isFetchingNextPage ? 'Loading...' : 'Next Page' }}
        </button>
      </div>
    </div>
  </div>
</template>
```

### Infinite Scroll

For infinite scroll, use all loaded pages:

```vue
<script setup lang="ts">
import { Pageable, Filters } from 'gen-query'
import type { Entity } from 'gen-query'

interface Post extends Entity<number> {
  title: string
  content: string
  author: string
}

const pageable = new Pageable(0, 10)
const filters = ref(new Filters())

const postQuery = usePaginatedQuery<Post, number>('posts', pageable, filters)

const {
  data: infiniteData,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading
} = postQuery.read

// Get all posts from all loaded pages
const allPosts = computed(() => 
  infiniteData.value?.pages.flatMap(page => page.content) ?? []
)

// Infinite scroll handler
const handleScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY
  const threshold = document.documentElement.scrollHeight - 100
  
  if (scrollPosition >= threshold && hasNextPage.value && !isFetchingNextPage.value) {
    fetchNextPage()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <div v-for="post in allPosts" :key="post.id" class="post">
        <h2>{{ post.title }}</h2>
        <p>{{ post.content }}</p>
        <small>By {{ post.author }}</small>
      </div>
      
      <div v-if="isFetchingNextPage" class="loading">
        Loading more posts...
      </div>
      
      <div v-else-if="!hasNextPage" class="end">
        No more posts to load
      </div>
    </div>
  </div>
</template>
```

## API Reference

### Composables

#### `useLoginService(resource?: string)`

Creates a login service for authentication.

**Parameters:**
- `resource` (optional): API endpoint for login. Default: `'auth'`

**Returns:**
```typescript
{
  login: {
    mutate: (credentials: Login, options?) => void
    isPending: Ref<boolean>
    isError: Ref<boolean>
    isSuccess: Ref<boolean>
    error: Ref<ApiError | null>
    data: Ref<User | undefined>
  }
}
```

---

#### `useSingleQuery<T, K>(resource: string, id: Ref<K>, token?: MaybeRefOrGetter<string | undefined>)`

Fetches and manages a single entity by ID.

**Type Parameters:**
- `T`: Entity type extending `Entity<K>`
- `K`: ID type (e.g., `number`, `string`)

**Parameters:**
- `resource`: API endpoint (e.g., `'products'`)
- `id`: Reactive reference to entity ID
- `token` (optional): Authentication token (reactive or getter)

**Returns:**
```typescript
{
  read: {
    data: Ref<T | undefined>
    error: Ref<ApiError | null>
    isLoading: Ref<boolean>
    isError: Ref<boolean>
    isSuccess: Ref<boolean>
    isFetching: Ref<boolean>
    status: Ref<'loading' | 'error' | 'success'>
    refetch: () => Promise<void>
  },
  create: {
    mutate: (entity: T, options?) => void
    isPending: Ref<boolean>
    isError: Ref<boolean>
    isSuccess: Ref<boolean>
    error: Ref<ApiError | null>
  },
  update: { /* same as create */ },
  del: { /* same as create */ }
}
```

---

#### `useMultipleQuery<T, K>(resource: string, token?: MaybeRefOrGetter<string | undefined>)`

Provides CRUD operations for a collection of entities.

**Type Parameters:**
- `T`: Entity type extending `Entity<K>`
- `K`: ID type

**Parameters:**
- `resource`: API endpoint
- `token` (optional): Authentication token

**Returns:**
```typescript
{
  read: {
    data: Ref<T[] | undefined>
    error: Ref<ApiError | null>
    isLoading: Ref<boolean>
    isError: Ref<boolean>
    isSuccess: Ref<boolean>
    isFetching: Ref<boolean>
    refetch: () => Promise<void>
  },
  create: { /* mutation object */ },
  update: { /* mutation object */ },
  del: { /* mutation object */ }
}
```

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

**Returns:**
```typescript
{
  read: {
    data: Ref<InfiniteData<Page<T>> | undefined>
    error: Ref<ApiError | null>
    isLoading: Ref<boolean>
    isError: Ref<boolean>
    isSuccess: Ref<boolean>
    isFetching: Ref<boolean>
    isFetchingNextPage: Ref<boolean>
    isFetchingPreviousPage: Ref<boolean>
    hasNextPage: Ref<boolean>
    hasPreviousPage: Ref<boolean>
    fetchNextPage: () => Promise<void>
    fetchPreviousPage: () => Promise<void>
    refetch: () => Promise<void>
  },
  create: { /* mutation object */ },
  update: { /* mutation object */ },
  del: { /* mutation object */ }
}
```

---

### Types

#### `Entity<K>`

Base interface for entities with an ID.

```typescript
interface Entity<K> {
  id: K
}
```

**Example:**
```typescript
interface Product extends Entity<number> {
  name: string
  price: number
}
```

---

#### `Login`

Login credentials.

```typescript
type Login = {
  username: string
  password: string
}
```

---

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

---

#### `Page<T>`

Paginated response structure.

```typescript
type Page<T> = {
  page: {
    number: number        // Current page (0-indexed)
    size: number          // Items per page
    totalElements: number // Total items across all pages
    totalPages: number    // Total number of pages
  }
  content: T[]           // Items in current page
}
```

---

#### `Sort`

Sorting configuration.

```typescript
type Sort = {
  property: string           // Field to sort by
  direction: 'asc' | 'desc' // Sort direction
}
```

---

#### `FilterItem`

Filter configuration.

```typescript
type FilterItem = {
  operator: string        // 'and' or 'or'
  constraints: Constraint[]
}
```

---

#### `Constraint`

Filter constraint.

```typescript
type Constraint = {
  matchMode: string  // eq, ne, lt, lte, gt, gte, contains, startsWith, endsWith, in
  value: unknown     // Filter value
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
const pageable = new Pageable(
  0,   // first page
  20,  // 20 items per page
  [
    { property: 'name', direction: 'asc' },
    { property: 'price', direction: 'desc' }
  ]
)
```

---

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

// Single constraint
filters.category = {
  operator: 'and',
  constraints: [{ matchMode: 'eq', value: 'electronics' }]
}

// Multiple constraints (AND)
filters.price = {
  operator: 'and',
  constraints: [
    { matchMode: 'gte', value: 100 },
    { matchMode: 'lte', value: 500 }
  ]
}

// Multiple constraints (OR)
filters.status = {
  operator: 'or',
  constraints: [
    { matchMode: 'eq', value: 'active' },
    { matchMode: 'eq', value: 'pending' }
  ]
}

// String matching
filters.name = {
  operator: 'and',
  constraints: [{ matchMode: 'contains', value: 'laptop' }]
}

// Date filtering
filters.createdAt = {
  operator: 'and',
  constraints: [{ matchMode: 'gte', value: new Date('2024-01-01') }]
}
```

**Available Match Modes:**

| Match Mode | Description | Example |
|------------|-------------|---------|
| `eq` | Equals | `{ matchMode: 'eq', value: 'active' }` |
| `ne` | Not equals | `{ matchMode: 'ne', value: 'deleted' }` |
| `lt` | Less than | `{ matchMode: 'lt', value: 100 }` |
| `lte` | Less than or equal | `{ matchMode: 'lte', value: 100 }` |
| `gt` | Greater than | `{ matchMode: 'gt', value: 50 }` |
| `gte` | Greater than or equal | `{ matchMode: 'gte', value: 50 }` |
| `contains` | Contains substring | `{ matchMode: 'contains', value: 'laptop' }` |
| `startsWith` | Starts with | `{ matchMode: 'startsWith', value: 'Pro' }` |
| `endsWith` | Ends with | `{ matchMode: 'endsWith', value: 'Pro' }` |
| `in` | In list | `{ matchMode: 'in', value: 'active,pending' }` |

---

#### `ApiError`

Custom error class for API errors.

```typescript
class ApiError extends Error {
  timestamp: Date
  type: string
  statusCode: number
  status: string
  content?: object
  stack?: string
}
```

**Example:**
```typescript
const { error } = productQuery.read

if (error.value) {
  console.error('Error:', error.value.message)
  console.error('Status:', error.value.statusCode)
  console.error('Details:', error.value.content)
}
```

---

### Enums

#### `UpdateStrategy`

Cache update strategy for mutations.

```typescript
enum UpdateStrategy {
  None,        // No automatic cache updates
  Invalidate,  // Invalidate and refetch (recommended)
  Optimistic   // Optimistic updates
}
```

**Usage:**
```typescript
import { UpdateStrategy } from 'gen-query'

export default defineNuxtConfig({
  genQuery: {
    update: UpdateStrategy.Optimistic
  }
})
```

## Backend Requirements

Your backend API must follow the REST specification detailed in [BACKEND_API.md](/BACKEND_API.md).

**Key requirements:**
- RESTful endpoints with JSON request/response
- Standard CRUD operations (GET, POST, PUT, DELETE)
- Pagination endpoint with `/page` suffix
- Support for filter and sort query parameters
- Consistent error response format
- ISO 8601 date format
- Optional Bearer token authentication

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with playground
npm run dev

# Build playground
npm run dev:build

# Run ESLint
npm run lint

# Run type checking
npm run test:types

# Run tests
npm run test
npm run test:watch

# Release new version
npm run release
```

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
