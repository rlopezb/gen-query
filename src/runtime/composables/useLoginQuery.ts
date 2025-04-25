import type { Ref } from 'vue'
import { LoginQuery, type Login } from '../utils'

export const useLoginQuery = (login: Ref<Login | null>) => {
  return new LoginQuery(login)
}
