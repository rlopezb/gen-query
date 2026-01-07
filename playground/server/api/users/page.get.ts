import { Pageable } from '../../../src/runtime/models'

export default defineEventHandler((event) => {
  const url = new URL(event.node.req.url || '', `http://${event.node.req.headers.host}`)
  const page = Number(url.searchParams.get('page') ?? '0')
  const size = Number(url.searchParams.get('size') ?? '10')

  // Simple mock users
  const all = Array.from({ length: 50 }).map((_, i) => ({
    id: i + 1,
    username: `user${i + 1}`,
    fullName: `User ${i + 1}`,
    email: `user${i + 1}@example.test`,
    token: `token-${i + 1}`,
  }))

  const start = page * size
  const content = all.slice(start, start + size)

  return {
    page: {
      number: page,
      size,
      totalElements: all.length,
      totalPages: Math.ceil(all.length / size),
    },
    content,
  }
})