import { LoginService } from '../services'

/**
 * Composable for creating a login service instance.
 * @param resource The resource endpoint for login. Defaults to 'auth'.
 * @returns A LoginService instance.
 */
export const useLoginService = (resource: string = 'auth') => {
  return new LoginService(resource)
}
