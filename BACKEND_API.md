# Backend API Specification for gen-query

This document provides a complete specification for backend developers implementing a REST API compatible with the `gen-query` Nuxt module.

## Table of Contents

- [Overview](#overview)
- [Quick Reference](#quick-reference)
- [Authentication](#authentication)
- [CRUD Operations](#crud-operations)
- [Pagination Endpoint](#pagination-endpoint)
- [Filter Syntax](#filter-syntax)
- [Sorting](#sorting)
- [Error Handling](#error-handling)
- [Complete Examples](#complete-examples)
- [Implementation Checklist](#implementation-checklist)
- [Testing Guide](#testing-guide)

---

## Overview

gen-query expects a RESTful API that follows these conventions:

- **Content Type**: JSON for all request and response bodies
- **Date Format**: ISO 8601 (`2024-01-15T10:30:00Z`)
- **Authentication**: Bearer token (optional)
- **Pagination**: 0-indexed pages
- **Error Format**: Consistent error response structure

### Base URL

All endpoints are relative to a base URL configured in the frontend:

```typescript
// nuxt.config.ts
genQuery: {
  baseURL: 'https://api.example.com'
}
```

For a resource named `products`, endpoints will be:
```
https://api.example.com/products
```

---

## Quick Reference

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/{resource}/login` | Authenticate user | `Login` | `User` |
| GET | `/{resource}` | List all entities | - | `T[]` |
| GET | `/{resource}/{id}` | Read single entity | - | `T` |
| POST | `/{resource}` | Create entity | `T` | `T` |
| PUT | `/{resource}` | Update entity | `T` | `T` |
| DELETE | `/{resource}` | Delete entity | `T` | `T` |
| GET | `/{resource}/page` | Paginated list | - | `Page<T>` |

---

## Authentication

### Login Endpoint

**Endpoint:** `POST /{resource}/login`

**Example:** `POST /auth/login`

**Request Headers:**
```http
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "username": "user@example.com",
  "fullName": "John Doe",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials",
  "type": "error",
  "name": "AuthenticationError",
  "statusCode": 401,
  "status": "error"
}
```

### Using Authentication Token

For authenticated requests, include the token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## CRUD Operations

### 1. List All Entities

**Endpoint:** `GET /{resource}`

**Example:** `GET /products`

**Request Headers:**
```http
Accept: application/json
Authorization: Bearer {token}  # Optional
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Laptop Pro 15",
    "price": 1299.99,
    "category": "electronics",
    "stock": 45,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:25:00Z"
  },
  {
    "id": 2,
    "name": "Wireless Mouse",
    "price": 29.99,
    "category": "accessories",
    "stock": 150,
    "createdAt": "2024-01-16T09:15:00Z",
    "updatedAt": "2024-01-16T09:15:00Z"
  }
]
```

---

### 2. Read Single Entity

**Endpoint:** `GET /{resource}/{id}`

**Example:** `GET /products/1`

**Request Headers:**
```http
Accept: application/json
Authorization: Bearer {token}  # Optional
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Laptop Pro 15",
  "price": 1299.99,
  "category": "electronics",
  "description": "High-performance laptop with 15-inch display",
  "stock": 45,
  "specifications": {
    "cpu": "Intel i7",
    "ram": "16GB",
    "storage": "512GB SSD"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:25:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Product with id 1 not found",
  "type": "error",
  "name": "NotFoundError",
  "statusCode": 404,
  "status": "error"
}
```

---

### 3. Create Entity

**Endpoint:** `POST /{resource}`

**Example:** `POST /products`

**Request Headers:**
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}  # Optional
```

**Request Body:**
```json
{
  "name": "Mechanical Keyboard",
  "price": 149.99,
  "category": "accessories",
  "description": "RGB mechanical gaming keyboard",
  "stock": 75
}
```

> **Note:** The `id` field should NOT be included in the request body. The server generates it.

**Success Response (201 Created):**
```json
{
  "id": 3,
  "name": "Mechanical Keyboard",
  "price": 149.99,
  "category": "accessories",
  "description": "RGB mechanical gaming keyboard",
  "stock": 75,
  "createdAt": "2024-01-21T11:00:00Z",
  "updatedAt": "2024-01-21T11:00:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Validation failed",
  "type": "error",
  "name": "ValidationError",
  "statusCode": 400,
  "status": "error",
  "content": {
    "errors": [
      {
        "field": "price",
        "message": "Price must be a positive number"
      },
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

---

### 4. Update Entity

**Endpoint:** `PUT /{resource}`

**Example:** `PUT /products`

**Request Headers:**
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}  # Optional
```

**Request Body:**
```json
{
  "id": 1,
  "name": "Laptop Pro 15 (Updated)",
  "price": 1199.99,
  "category": "electronics",
  "description": "High-performance laptop - Special offer!",
  "stock": 40
}
```

> **Important:** The `id` field MUST be included to identify which entity to update.

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Laptop Pro 15 (Updated)",
  "price": 1199.99,
  "category": "electronics",
  "description": "High-performance laptop - Special offer!",
  "stock": 40,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-21T15:30:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Product with id 1 not found",
  "type": "error",
  "name": "NotFoundError",
  "statusCode": 404,
  "status": "error"
}
```

---

### 5. Delete Entity

**Endpoint:** `DELETE /{resource}`

**Example:** `DELETE /products`

**Request Headers:**
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}  # Optional
```

**Request Body:**
```json
{
  "id": 3
}
```

> **Important:** The `id` field MUST be included to identify which entity to delete.

**Success Response (200 OK):**
```json
{
  "id": 3,
  "name": "Mechanical Keyboard",
  "price": 149.99,
  "category": "accessories",
  "deleted": true
}
```

> **Alternative:** Some APIs prefer soft deletes and return the full entity with a `deletedAt` timestamp instead of a `deleted` boolean.

**Error Response (404 Not Found):**
```json
{
  "message": "Product with id 3 not found",
  "type": "error",
  "name": "NotFoundError",
  "statusCode": 404,
  "status": "error"
}
```

---

## Pagination Endpoint

### Paginated List

**Endpoint:** `GET /{resource}/page?{queryParams}`

**Example:** 
```
GET /products/page?size=20&page=0&sort=name,asc&filter=price:gte:100
```

**Request Headers:**
```http
Accept: application/json
Authorization: Bearer {token}  # Optional
```

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `size` | integer | Yes | Number of items per page | `size=20` |
| `page` | integer | Yes | Page number (0-indexed) | `page=0` |
| `sort` | string | No | Field and direction (comma-separated) | `sort=name,asc` |
| `filter` | string | No | Filter expression | `filter=price:gte:100` |

**Success Response (200 OK):**
```json
{
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  },
  "content": [
    {
      "id": 1,
      "name": "Laptop Pro 15",
      "price": 1299.99,
      "category": "electronics",
      "stock": 45,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": 4,
      "name": "Monitor 27\"",
      "price": 399.99,
      "category": "electronics",
      "stock": 30,
      "createdAt": "2024-01-17T08:45:00Z"
    }
  ]
}
```

### Page Metadata

The `page` object contains pagination metadata:

| Field | Type | Description |
|-------|------|-------------|
| `number` | integer | Current page number (0-indexed) |
| `size` | integer | Number of items per page |
| `totalElements` | integer | Total number of items across all pages |
| `totalPages` | integer | Total number of pages |

---

## Filter Syntax

### Single Filter

**Format:** `field:matchMode:value`

The separator is the colon character `:`.

**Example:**
```
filter=price:gte:100
```

**Meaning:** Price greater than or equal to 100

### Multiple Filters (AND)

Use multiple `filter` parameters:

```
filter=category:eq:electronics&filter=price:gte:100&filter=price:lte:500
```

**Meaning:** Category equals "electronics" AND price >= 100 AND price <= 500

### Multiple Filters (OR)

Use pipe `|` to separate conditions within a single filter:

```
filter=category:eq:electronics|category:eq:computers
```

**Meaning:** Category equals "electronics" OR category equals "computers"

> **Note:** The separator between field, matchMode, and value is always `:`. The pipe `|` is used to separate multiple conditions within the same filter parameter for OR logic.


### Match Modes

| Match Mode | Description | Example | SQL Equivalent |
|------------|-------------|---------|----------------|
| `eq` | Equals | `status:eq:active` | `WHERE status = 'active'` |
| `ne` | Not equals | `status:ne:deleted` | `WHERE status != 'deleted'` |
| `lt` | Less than | `price:lt:100` | `WHERE price < 100` |
| `lte` | Less than or equal | `price:lte:100` | `WHERE price <= 100` |
| `gt` | Greater than | `price:gt:50` | `WHERE price > 50` |
| `gte` | Greater than or equal | `price:gte:50` | `WHERE price >= 50` |
| `contains` | Contains substring (case-insensitive) | `name:contains:laptop` | `WHERE LOWER(name) LIKE '%laptop%'` |
| `startsWith` | Starts with | `name:startsWith:Pro` | `WHERE name LIKE 'Pro%'` |
| `endsWith` | Ends with | `name:endsWith:Pro` | `WHERE name LIKE '%Pro'` |
| `in` | In list (comma-separated) | `status:in:active,pending` | `WHERE status IN ('active', 'pending')` |

### Date Filters

Dates should be sent as ISO 8601 strings:

```
filter=createdAt:gte:2024-01-01T00:00:00Z
```

The backend should parse ISO 8601 date strings and compare them appropriately.

### Complex Filter Examples

**Example 1:** Products priced between $100 and $500
```
filter=price:gte:100&filter=price:lte:500
```

**Example 2:** Electronics or computers category
```
filter=category:eq:electronics|category:eq:computers
```

**Example 3:** Name contains "laptop" and in stock
```
filter=name:contains:laptop&filter=stock:gt:0
```

**Example 4:** Created in 2024 and price > $50
```
filter=createdAt:gte:2024-01-01T00:00:00Z&filter=createdAt:lt:2025-01-01T00:00:00Z&filter=price:gt:50
```

---

## Sorting

### Single Sort

**Format:** `sort=field,direction`

**Example:**
```
sort=name,asc
```

**Directions:**
- `asc` - Ascending order (A-Z, 0-9, oldest-newest)
- `desc` - Descending order (Z-A, 9-0, newest-oldest)

### Multiple Sorts

Use multiple `sort` parameters to sort by multiple fields:

```
sort=category,asc&sort=price,desc
```

**Meaning:** Sort by category ascending, then by price descending within each category.

**Example URL:**
```
GET /products/page?size=20&page=0&sort=category,asc&sort=price,desc
```

---

## Error Handling

### Error Response Structure

All errors MUST follow this format:

```json
{
  "message": "Human-readable error message",
  "type": "error",
  "name": "ErrorType",
  "statusCode": 400,
  "status": "error",
  "content": {
    // Optional additional error details
  },
  "stack": "Error stack trace (only in development)"
}
```

### HTTP Status Codes

| Code | Name | When to Use |
|------|------|-------------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (entity created) |
| 400 | Bad Request | Invalid request data, validation errors |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Entity not found |
| 422 | Unprocessable Entity | Business logic validation failed |
| 500 | Internal Server Error | Unexpected server error |

### Error Examples

**Validation Error (400):**
```json
{
  "message": "Validation failed",
  "type": "error",
  "name": "ValidationError",
  "statusCode": 400,
  "status": "error",
  "content": {
    "errors": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "price",
        "message": "Price must be greater than 0"
      }
    ]
  }
}
```

**Authentication Error (401):**
```json
{
  "message": "Authentication required",
  "type": "error",
  "name": "AuthenticationError",
  "statusCode": 401,
  "status": "error"
}
```

**Authorization Error (403):**
```json
{
  "message": "You do not have permission to perform this action",
  "type": "error",
  "name": "ForbiddenError",
  "statusCode": 403,
  "status": "error"
}
```

**Not Found Error (404):**
```json
{
  "message": "Product with id 999 not found",
  "type": "error",
  "name": "NotFoundError",
  "statusCode": 404,
  "status": "error"
}
```

**Server Error (500):**
```json
{
  "message": "An unexpected error occurred",
  "type": "error",
  "name": "InternalServerError",
  "statusCode": 500,
  "status": "error",
  "stack": "Error: ... (only in development)"
}
```

---

## Complete Examples

### Example 1: Full CRUD Workflow

```bash
# 1. Login
curl -X POST https://api.example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret"}'

# Response: {"username":"admin","token":"eyJhbG..."}

# 2. List all products
curl https://api.example.com/products \
  -H "Authorization: Bearer eyJhbG..."

# 3. Get product by ID
curl https://api.example.com/products/1 \
  -H "Authorization: Bearer eyJhbG..."

# 4. Create product
curl -X POST https://api.example.com/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbG..." \
  -d '{"name":"New Product","price":99.99,"category":"electronics","stock":50}'

# Response: {"id":10,"name":"New Product",...}

# 5. Update product
curl -X PUT https://api.example.com/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbG..." \
  -d '{"id":10,"name":"Updated Product","price":89.99,"category":"electronics","stock":45}'

# 6. Delete product
curl -X DELETE https://api.example.com/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbG..." \
  -d '{"id":10}'

# 7. Paginated list with filters
curl "https://api.example.com/products/page?size=20&page=0&sort=name,asc&filter=price:gte:50&filter=category:eq:electronics" \
  -H "Authorization: Bearer eyJhbG..."
```

---

### Example 2: Complex Filtering

**Scenario:** Get electronics products priced between $100 and $500, sorted by price descending

**URL:**
```
GET /products/page?size=20&page=0&sort=price,desc&filter=category:eq:electronics&filter=price:gte:100&filter=price:lte:500
```

**Backend SQL (pseudo-code):**
```sql
SELECT * FROM products
WHERE category = 'electronics'
  AND price >= 100
  AND price <= 500
ORDER BY price DESC
LIMIT 20 OFFSET 0
```

---

### Example 3: Search with OR Logic

**Scenario:** Search for products with "laptop" OR "computer" in name, in stock

**URL:**
```
GET /products/page?size=20&page=0&filter=name:contains:laptop|name:contains:computer&filter=stock:gt:0
```

**Backend SQL (pseudo-code):**
```sql
SELECT * FROM products
WHERE (LOWER(name) LIKE '%laptop%' OR LOWER(name) LIKE '%computer%')
  AND stock > 0
LIMIT 20 OFFSET 0
```

---

### Example 4: Date Range Filtering

**Scenario:** Products created in January 2024

**URL:**
```
GET /products/page?size=20&page=0&filter=createdAt:gte:2024-01-01T00:00:00Z&filter=createdAt:lt:2024-02-01T00:00:00Z
```

**Backend SQL (pseudo-code):**
```sql
SELECT * FROM products
WHERE createdAt >= '2024-01-01T00:00:00Z'
  AND createdAt < '2024-02-01T00:00:00Z'
LIMIT 20 OFFSET 0
```

---

## Implementation Checklist

Backend developers should ensure:

- [ ] All CRUD endpoints implemented (GET, POST, PUT, DELETE)
- [ ] Pagination endpoint with `/page` suffix
- [ ] Support for `size`, `page`, `sort`, and `filter` query parameters
- [ ] Filter parsing for all match modes (eq, ne, lt, lte, gt, gte, contains, startsWith, endsWith, in)
- [ ] Support for multiple filters with AND logic (multiple filter params)
- [ ] Support for multiple filters with OR logic (pipe-separated)
- [ ] Consistent error response format
- [ ] All dates in ISO 8601 format
- [ ] Bearer token authentication (if required)
- [ ] Proper CORS headers
- [ ] Input validation for all endpoints
- [ ] Appropriate HTTP status codes
- [ ] Pagination metadata in page responses
- [ ] 0-indexed pagination
- [ ] Case-insensitive string matching for `contains`, `startsWith`, `endsWith`

---

## Testing Guide

### Testing with curl

```bash
# Test list endpoint
curl -X GET "https://api.example.com/products"

# Test pagination
curl -X GET "https://api.example.com/products/page?size=10&page=0"

# Test sorting
curl -X GET "https://api.example.com/products/page?size=10&page=0&sort=name,asc"

# Test filtering
curl -X GET "https://api.example.com/products/page?size=10&page=0&filter=price:gte:100"

# Test create
curl -X POST "https://api.example.com/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":99.99}'

# Test update
curl -X PUT "https://api.example.com/products" \
  -H "Content-Type: application/json" \
  -d '{"id":1,"name":"Updated Product","price":89.99}'

# Test delete
curl -X DELETE "https://api.example.com/products" \
  -H "Content-Type: application/json" \
  -d '{"id":1}'
```

### Testing with gen-query

Create a simple Nuxt app to test your API:

```vue
<script setup lang="ts">
import { Pageable, Filters } from 'gen-query'
import type { Entity } from 'gen-query'

interface Product extends Entity<number> {
  name: string
  price: number
  category: string
}

const token = ref('your-auth-token')

// Test list
const productQuery = useMultipleQuery<Product, number>('products', token)
const { data: products } = productQuery.read

// Test create
const { mutate: createProduct } = productQuery.create
createProduct({ name: 'Test Product', price: 99.99, category: 'test' })

// Test update
const { mutate: updateProduct } = productQuery.update
updateProduct({ id: 1, name: 'Updated Product', price: 89.99, category: 'test' })

// Test delete
const { mutate: deleteProduct } = productQuery.del
deleteProduct({ id: 1 })

// Test pagination with filters
const pageable = new Pageable(0, 20, [{ property: 'name', direction: 'asc' }])
const filters = ref(new Filters())
filters.value.price = {
  operator: 'and',
  constraints: [{ matchMode: 'gte', value: 50 }]
}

const paginatedQuery = usePaginatedQuery<Product, number>(
  'products',
  pageable,
  filters,
  token
)

const { data: page } = paginatedQuery.read
</script>
```

### Validation Checklist

Verify your API returns correct responses for:

- [ ] Empty result sets (empty array `[]` or page with empty `content`)
- [ ] Single item results
- [ ] Large result sets
- [ ] Invalid filter syntax
- [ ] Invalid sort fields
- [ ] Out of range page numbers
- [ ] Invalid entity IDs
- [ ] Missing required fields
- [ ] Invalid data types
- [ ] Duplicate entities
- [ ] Concurrent updates
- [ ] Authentication failures
- [ ] Authorization failures

---

## Additional Resources

- [gen-query NPM Package](https://npmjs.com/package/gen-query)
- [gen-query GitHub Repository](https://github.com/rlopezb/gen-query)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

---

**Questions or Issues?**

If you encounter any issues implementing this API specification, please open an issue on the [GitHub repository](https://github.com/rlopezb/gen-query/issues).
