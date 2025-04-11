import { LoginService } from '../utils'

export const useLoginService = (resource: string) => {
  return new LoginService(resource)
}
