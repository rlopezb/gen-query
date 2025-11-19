import { LoginService } from '../services'

export const useLoginService = (resource: string = 'auth') => {
  return new LoginService(resource)
}
