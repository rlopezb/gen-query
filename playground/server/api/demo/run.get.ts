export default defineEventHandler(async () => {
  // Call local auth endpoint (simulating LoginService)
  const user = await $fetch('/api/auth/login', { method: 'POST', body: { username: 'play', password: 'test' } })

  // Call local users page endpoint (simulating Service.page)
  const page = await $fetch('/api/users/page?size=5&page=0')

  return {
    login: user,
    users: page,
  }
})