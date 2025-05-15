<script lang="ts" setup>
import type { Login } from '../../src/module'
import { useUserStore } from '~/stores/useUserStore'

definePageMeta({
  layout: 'login',
})

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const loginService = useLoginService()
const onLogin = async (login: Login) => {
  user.value = await loginService.login(login)
}
</script>

<template>
  <LoginCard @login="onLogin" />
</template>
