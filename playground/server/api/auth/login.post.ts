export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username = 'guest' } = body || {}

  return {
    username,
    password: '***',
    fullName: 'Playground User',
    email: `${username}@example.test`,
    token: 'playground-token-123',
  }
})