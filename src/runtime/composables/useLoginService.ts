import { LoginService } from '../utils'

export const useLoginService = () => {
  return new LoginService('auth')
}
