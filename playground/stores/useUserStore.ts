import type { User } from '../../src/module'

export const useUserStore = defineStore(
  'AppStore',
  () => {
    const user: Ref<User | null | undefined> = ref()
    return { user }
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
)
