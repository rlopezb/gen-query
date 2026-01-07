import { defineEventHandler, readBody, setCookie, getCookie, proxyRequest } from 'h3'
import type { Login, User } from '../../types'
import { useLoginService } from '../../composables/useLoginService'

export default defineEventHandler(async (event) => {
  if (event.path.endsWith('/login')) {
    const login: Login = await readBody(event)
    const loginService = useLoginService()
    const user: User = await loginService.login(login)
    const userCookie = Buffer.from(JSON.stringify(user)).toString('base64')
    setCookie(event, 'user', userCookie, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    })
  }
  else {
    const userCookie = getCookie(event, 'user')
    const token = userCookie ? JSON.parse(Buffer.from(userCookie, 'base64').toString('utf-8')).token : null
    return proxyRequest(event, event.path, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }
})
