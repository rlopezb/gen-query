import { LoginService } from '../types'

export const useLoginService = (resource: string) => {
  return new LoginService(resource)
}
