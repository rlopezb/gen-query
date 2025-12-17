# Changelog


## v1.7.3

[compare changes](https://github.com/rlopezb/gen-query/compare/v1.7.2...v1.7.3)

### 🏡 Chore

- Update various dependencies to their latest patch and minor versions. ([75440c1](https://github.com/rlopezb/gen-query/commit/75440c1))

### ❤️ Contributors

- Rafael López Benavente <rlopezb@gmail.com>

## v1.7.2

[compare changes](https://github.com/rlopezb/gen-query/compare/v1.7.1...v1.7.2)

## v1.7.0

[compare changes](https://github.com/rlopezb/gen-query/compare/v1.6.0...v1.7.0)

### 🚀 Enhancements

- Introduce advanced cache update strategies, infinite scroll, and comprehensive usage examples for all composables. ([18da780](https://github.com/rlopezb/gen-query/commit/18da780))

### ❤️ Contributors

- Rafael López Benavente <rlopezb@gmail.com>

## v1.6.0

[compare changes](https://github.com/rlopezb/gen-query/compare/v1.5.0...v1.6.0)

### 🚀 Enhancements

- Add build configuration for module and update package metadata with `require` export. ([3959b40](https://github.com/rlopezb/gen-query/commit/3959b40))
- Add gen-query module implementation and comprehensive documentation, removing a server tsconfig. ([7ab1df3](https://github.com/rlopezb/gen-query/commit/7ab1df3))
- Refactor optimistic mutations into a shared helper, simplify query function calls and pagination, and enhance API error handling. ([846fd3f](https://github.com/rlopezb/gen-query/commit/846fd3f))
- Update README examples and API descriptions to reflect new `read` method, `del` mutation, and expanded query/mutation states like `isPending`, `isError`, and `error`. ([6fa3102](https://github.com/rlopezb/gen-query/commit/6fa3102))

### 💅 Refactors

- Delete custom type declarations and explicitly import `useRuntimeConfig` in `useQueryFetch`. ([586aa08](https://github.com/rlopezb/gen-query/commit/586aa08))
- Update `useRuntimeConfig` import path from `@nuxt/kit` to `#app`. ([ea66142](https://github.com/rlopezb/gen-query/commit/ea66142))
- Add `UseInfiniteQueryReturnType` type to `PaginatedQuery.page` and bump package version. ([2f117f8](https://github.com/rlopezb/gen-query/commit/2f117f8))

### 🏡 Chore

- Remove playground and test fixtures, and refactor module options and exports. ([01c924d](https://github.com/rlopezb/gen-query/commit/01c924d))
- Bump package version to 1.5.3 ([39b3146](https://github.com/rlopezb/gen-query/commit/39b3146))

### ❤️ Contributors

- Rafael López Benavente <rlopezb@gmail.com>

## v1.5.0

[compare changes](https://github.com/rlopezb/gen-query/compare/v1.4.0...v1.5.0)

### 🚀 Enhancements

- Document new `useSingleQuery`, `useMultipleQuery`, `usePaginatedQuery`, and `useLoginService` composables with usage examples and API reference. ([dc8a896](https://github.com/rlopezb/gen-query/commit/dc8a896))

### ❤️ Contributors

- Rafael López Benavente <rlopezb@gmail.com>

## v1.4.0

[compare changes](https://github.com/rlopezb/gen-query/compare/v1.3.0...v1.4.0)

### 🚀 Enhancements

- Introduce `useQueryFetch` composable with new types, API documentation, and module integration. ([7ccb1f9](https://github.com/rlopezb/gen-query/commit/7ccb1f9))

### ❤️ Contributors

- Rafael López Benavente <rlopezb@gmail.com>

## v1.3.0


### 🚀 Enhancements

- **module:** Add gen-query Nuxt module with composables for queries and services ([3d1d402](https://github.com/rlopezb/gen-query/commit/3d1d402))
- **readme:** Update module name and description to Gen Query with tanstack query integration ([c08d14e](https://github.com/rlopezb/gen-query/commit/c08d14e))
- **login:** Implement LoginQuery and useLoginQuery for login functionality ([b749b4f](https://github.com/rlopezb/gen-query/commit/b749b4f))
- **login:** Update useLoginQuery to accept Ref<Login ([ null> and adjust LoginQuery constructor fix(package): bump version to 1.2.7](https://github.com/rlopezb/gen-query/commit/ null> and adjust LoginQuery constructor fix(package): bump version to 1.2.7))
- Refactor runtime utilities into dedicated type, model, service, and query files, and enhance `useQueryFetch` with token support and improved error handling. ([1cf933c](https://github.com/rlopezb/gen-query/commit/1cf933c))
- Enhance `useMultipleQuery`, `usePaginatedQuery`, and `useSingleQuery` to accept reactive tokens and make `useLoginService` resource configurable. ([a37eeb7](https://github.com/rlopezb/gen-query/commit/a37eeb7))
- Add `baseURL` default to module options, enhance `useQueryFetch` error handling with `ApiError` helper, and export new query-related types and services. ([9928d47](https://github.com/rlopezb/gen-query/commit/9928d47))
- Integrate TanStack Vue Query with SSR support via a new plugin and rewrite README with comprehensive documentation and examples. ([22d4258](https://github.com/rlopezb/gen-query/commit/22d4258))

### 🩹 Fixes

- **module:** Correct path to composables directory in gen-query Nuxt module ([086320d](https://github.com/rlopezb/gen-query/commit/086320d))
- **package:** Bump version to 1.2.1 ([055d55c](https://github.com/rlopezb/gen-query/commit/055d55c))
- **package:** Bump version to 1.2.2 and update module exports ([7ea0155](https://github.com/rlopezb/gen-query/commit/7ea0155))
- **package:** Add require export to module for compatibility ([8ce107e](https://github.com/rlopezb/gen-query/commit/8ce107e))
- **package:** Bump version to 1.2.3 ([090dff3](https://github.com/rlopezb/gen-query/commit/090dff3))
- **module:** Update type exports to include Entity ([16ace50](https://github.com/rlopezb/gen-query/commit/16ace50))
- **package:** Bump version to 1.2.4 ([1ef8055](https://github.com/rlopezb/gen-query/commit/1ef8055))
- **package:** Bump version to 1.2.5 ([1174166](https://github.com/rlopezb/gen-query/commit/1174166))
- **package:** Bump version to 1.2.6 ([9436c9c](https://github.com/rlopezb/gen-query/commit/9436c9c))
- **login:** Update login query condition to check for login.value instead of login ([7d97a22](https://github.com/rlopezb/gen-query/commit/7d97a22))
- **package:** Bump version to 1.2.9 ([62cd916](https://github.com/rlopezb/gen-query/commit/62cd916))
- **package:** Bump version to 1.2.10 ([5c1f9e8](https://github.com/rlopezb/gen-query/commit/5c1f9e8))

### 💅 Refactors

- Remove useLoginQuery and integrate login logic into useLoginService ([a6c83c7](https://github.com/rlopezb/gen-query/commit/a6c83c7))

### 📖 Documentation

- Add JSDoc comments to services, composables, models, and queries, and implement optimistic updates for create mutations. ([c87c885](https://github.com/rlopezb/gen-query/commit/c87c885))

### 🏡 Chore

- Update pnpm-workspace.yaml to include additional built dependencies ([a90058c](https://github.com/rlopezb/gen-query/commit/a90058c))
- Update package versions and dependencies ([05ccfc3](https://github.com/rlopezb/gen-query/commit/05ccfc3))
- Update version to 1.2.18 and fix error handling in useQueryFetch ([81be55e](https://github.com/rlopezb/gen-query/commit/81be55e))
- Update version to 1.2.19 and enhance error handling in useQueryFetch ([5d72019](https://github.com/rlopezb/gen-query/commit/5d72019))
- Update dependencies and improve type annotations for query mutation and infinite query callbacks. ([d99b186](https://github.com/rlopezb/gen-query/commit/d99b186))

### ❤️ Contributors

- Rafael López Benavente <rlopezb@gmail.com>
- Ad8a353 <Rafael López Benavente>

