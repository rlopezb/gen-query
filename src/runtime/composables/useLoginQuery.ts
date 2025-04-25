import { LoginQuery, type Login } from '../utils'

export const useLoginQuery = (login: Login | null) => {
  return new LoginQuery(login)
}
