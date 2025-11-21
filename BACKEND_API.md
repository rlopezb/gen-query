# Backend API Specification for gen-query

This document provides a complete specification for backend developers implementing a REST API compatible with the `gen-query` Nuxt module.

## Table of Contents

- [Overview](#overview)
- [Base Configuration](#base-configuration)
- [Authentication](#authentication)
- [CRUD Operations](#crud-operations)
- [Pagination and Filtering](#pagination-and-filtering)
- [Query Parameters](#query-parameters)
- [Filter Syntax](#filter-syntax)
- [Response Formats](#response-formats)
- [Error Handling](#error-handling)
- [Complete Examples](#complete-examples)

---

## Overview

gen-query expects a RESTful API that follows these conventions:

- **JSON** for all request and response bodies
- **ISO 8601** format for dates (`2024-01-15T10:30:00Z`)
- **Bearer token** authentication (optional)
- **0-indexed** pagination
- **Consistent** error response format

---

## Base Configuration

All endpoints are relative to a base URL configured in the frontend:

```typescript
// nuxt.config.ts
genQuery: {
  baseURL: 'https://api.example.com'
}
```

For a resource named `products`, all endpoints will be prefixed with:
```
https://api.example.com/products
```

---

## Authentication

### Login Endpoint

**URL Pattern:** `POST /{resource}/login`

**Example:** `POST /auth/login`

**Request Headers:**
```
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

**Success Response (200):**
```json
{
  "username": "user@example.com",
  "fullName": "John Doe",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials",
  "type": "error",
  "name": "AuthenticationError",
  "statusCode": 401,
  "status": "error"
}
```

---

## CRUD Operations

### 1. List All Entities

**URL Pattern:** `GET /{resource}`

**Example:** `GET /products`

**Request Headers:**
```
Accept: application/json
Authorization: Bearer {token}  // Optional
```

**Success Response (200):**
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

**URL Pattern:** `GET /{resource}/{id}`

**Example:** `GET /products/1`

**Request Headers:**
```
Accept: application/json
Authorization: Bearer {token}  // Optional
```

**Success Response (200):**
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

**Error Response (404):**
```json
{
  "message": "Product not found",
  "type": "error",
  "name": "NotFoundError",
  "statusCode": 404,
  "status": "error"
}
```

---

### 3. Create Entity

**URL Pattern:** `POST /{resource}`

**Example:** `POST /products`

**Request Headers:**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}  // Optional
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

**Success Response (201):**
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

**Error Response (400):**
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
      }
    ]
  }
}
```

---

### 4. Update Entity

**URL Pattern:** `PUT /{resource}`

**Example:** `PUT /products`

**Request Headers:**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}  // Optional
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

**Success Response (200):**
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

---

### 5. Delete Entity

**URL Pattern:** `DELETE /{resource}`

**Example:** `DELETE /products`

**Request Headers:**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}  // Optional
```

**Request Body:**
```json
{
  "id": 3
}
```

**Success Response (200):**
```json
{
  "id": 3,
  "name": "Mechanical Keyboard",
  "deleted": true
}
```

**Alternative:** Some APIs prefer soft deletes and return the full entity with a `deletedAt` timestamp.

---

## Pagination and Filtering

### Paginated List Endpoint

**URL Pattern:** `GET /{resource}/page?{queryParams}`

**Example:** `GET /products/page?size=20&page=0&sort=name,asc&filter=price‚gte‚100`

**Request Headers:**
```
Accept: application/json
Authorization: Bearer {token}  // Optional
```

**Success Response (200):**
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

---

## Query Parameters

### Pagination Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `size` | integer | Yes | Number of items per page | `size=20` |
| `page` | integer | Yes | Page number (0-indexed) | `page=0` |

### Sorting Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `sort` | string | No | Field and direction (comma-separated) | `sort=name,asc` |

**Multiple sorts:**
```
?sort=category,asc&sort=price,desc
```

**Sort directions:**
- `asc` - Ascending order
- `desc` - Descending order

### Filter Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `filter` | string | No | Filter expression | `filter=price‚gte‚100` |

---

## Filter Syntax

### Single Filter

**Format:** `field‚matchMode‚value`

**Example:**
```
filter=price‚gte‚100
```

**Decoded:** `price‚gte‚100` means "price greater than or equal to 100"

### Multiple Filters (AND)

**Format:** `field1:matchMode:value1&field2:matchMode:value2`

**Example:**
```
filter=name:contains:laptop&price:gte:500
```

**Decoded:** "name contains 'laptop' AND price >= 500"

### Multiple Filters (OR)

**Format:** `field:matchMode:value1|field:matchMode:value2`

**Example:**
```
filter=category:eq:electronics|category:eq:computers
```

**Decoded:** "category equals 'electronics' OR category equals 'computers'"

### Match Modes

| Match Mode | Description | Example | SQL Equivalent |
|------------|-------------|---------|----------------|
| `eq` | Equals | `status‚eq‚active` | `WHERE status = 'active'` |
| `ne` | Not equals | `status‚ne‚deleted` | `WHERE status != 'deleted'` |
| `lt` | Less than | `price‚lt‚100` | `WHERE price < 100` |
| `lte` | Less than or equal | `price‚lte‚100` | `WHERE price <= 100` |
| `gt` | Greater than | `price‚gt‚50` | `WHERE price > 50` |
| `gte` | Greater than or equal | `price‚gte‚50` | `WHERE price >= 50` |
| `contains` | Contains substring (case-insensitive) | `name‚contains‚laptop` | `WHERE LOWER(name) LIKE '%laptop%'` |
| `startsWith` | Starts with | `name‚startsWith‚Pro` | `WHERE name LIKE 'Pro%'` |
| `endsWith` | Ends with | `name‚endsWith‚Pro` | `WHERE name LIKE '%Pro'` |
| `in` | In list (comma-separated) | `status‚in‚active,pending` | `WHERE status IN ('active', 'pending')` |

### Date Filters

Dates should be sent as ISO 8601 strings:

```
filter=createdAt‚gte‚2024-01-01T00:00:00Z
```

---

## Response Formats

### Success Response Structure

**List Response:**
```json
[
  { "id": 1, "name": "Item 1" },
  { "id": 2, "name": "Item 2" }
]
```

**Single Entity Response:**
```json
{
  "id": 1,
  "name": "Item 1",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Paginated Response:**
```json
{
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  },
  "content": [
    { "id": 1, "name": "Item 1" }
  ]
}
```

### Page Metadata

| Field | Type | Description |
|-------|------|-------------|
| `number` | integer | Current page number (0-indexed) |
| `size` | integer | Number of items per page |
| `totalElements` | integer | Total number of items across all pages |
| `totalPages` | integer | Total number of pages |

---

## Error Handling

### Error Response Structure

All errors should follow this format:

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

### Example Error Responses

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

---

## Complete Examples

### Example 1: Products API

**Endpoints:**
```
POST   /auth/login
GET    /products
GET    /products/1
POST   /products
PUT    /products
DELETE /products
GET    /products/page
```

**Sample Requests:**

```bash
# Login
curl -X POST https://api.example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret"}'

# List all products
curl https://api.example.com/products \
  -H "Authorization: Bearer {token}"

# Get product by ID
curl https://api.example.com/products/1 \
  -H "Authorization: Bearer {token}"

# Create product
curl -X POST https://api.example.com/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"name":"New Product","price":99.99}'

# Update product
curl -X PUT https://api.example.com/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"id":1,"name":"Updated Product","price":89.99}'

# Delete product
curl -X DELETE https://api.example.com/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"id":1}'

# Paginated list with filters
curl "https://api.example.com/products/page?size=20&page=0&sort=name,asc&filter=price‚gte‚50" \
  -H "Authorization: Bearer {token}"
```

---

### Example 2: Complex Filtering

**Scenario:** Get electronics products priced between $100 and $500, sorted by price descending

**URL:**
```
GET /products/page?size=20&page=0&sort=price,desc&filter=category‚eq‚electronics&filter=price‚gte‚100&filter=price‚lte‚500
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

### Example 3: Search with Multiple Criteria

**Scenario:** Search for products with "laptop" in name OR "computer" in name, in stock

**URL:**
```
GET /products/page?size=20&page=0&filter=name:contains:laptop|name:contains:computer&filter=stock‚gt‚0
```

**Backend SQL (pseudo-code):**
```sql
SELECT * FROM products
WHERE (LOWER(name) LIKE '%laptop%' OR LOWER(name) LIKE '%computer%')
  AND stock > 0
LIMIT 20 OFFSET 0
```

---

## Implementation Checklist

- [ ] Implement all CRUD endpoints (GET, POST, PUT, DELETE)
- [ ] Implement pagination endpoint with `/page` suffix
- [ ] Support `size`, `page`, and `sort` query parameters
- [ ] Implement filter parsing for all match modes
- [ ] Support multiple filters (AND/OR logic)
- [ ] Return consistent error format
- [ ] Use ISO 8601 for all dates
- [ ] Implement Bearer token authentication (if needed)
- [ ] Add proper CORS headers
- [ ] Validate all input data
- [ ] Return appropriate HTTP status codes
- [ ] Include pagination metadata in page responses
- [ ] Test with gen-query frontend

---

## Testing Your API

Use the gen-query playground or create a simple Nuxt app:

```typescript
// Frontend test
const service = new Service<Product, number>('products', token)

// Test list
const products = await service.list()

// Test pagination
const page = await service.page(
  new Pageable(0, 20, [{ property: 'name', direction: 'asc' }]),
  filters
)

// Test CRUD
const created = await service.create({ name: 'Test', price: 99 })
const updated = await service.update({ ...created, price: 89 })
await service.delete(updated)
```

---

## Additional Resources

- [gen-query NPM Package](https://npmjs.com/package/gen-query)
- [gen-query GitHub Repository](https://github.com/rlopezb/gen-query)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

---

**Questions or Issues?**

If you encounter any issues implementing this API specification, please open an issue on the [GitHub repository](https://github.com/rlopezb/gen-query/issues).
