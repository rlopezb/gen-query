<script lang="ts" setup>
import type { Login } from '../../src/module'

const emit = defineEmits<{ login: [login: Login] }>()
const login: Login = { username: '', password: '' }
</script>

<template>
  <Card
    class="shadow-8"
    style="width: 24rem;"
  >
    <template #content>
      <div class="text-center mb-2">
        <Avatar
          icon="pi pi-user"
          size="xlarge"
          shape="circle"
        />
        <h1 class="text-2xl font-bold">
          Bienvenido!
        </h1>
      </div>
      <div class="grid">
        <div class="col-12 p-fluid py-2">
          <label for="username">Usuario</label>
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-user" />
            </InputGroupAddon>
            <InputText
              id="username"
              v-model="login.username"
              class="w-full"
            />
          </InputGroup>
        </div>
        <div class="col-12 p-fluid py-2">
          <label for="password">Password</label>
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-lock" />
            </InputGroupAddon>
            <Password
              id="password"
              v-model="login.password"
              class="w-full"
              :feedback="false"
              toggle-mask
            />
          </InputGroup>
        </div>
      </div>
    </template>
    <template #footer>
      <Button
        label="Login"
        class="w-full mt-1"
        @click="emit('login', login)"
      />
    </template>
  </Card>
</template>
