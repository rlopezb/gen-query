import { LoginService } from '../services'

export const useLoginService = () => {
  return new LoginService('auth')
}
