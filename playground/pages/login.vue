<script setup lang="ts">
import { ref } from "#imports";
import { useLoginService } from "../../src/runtime/composables/useLoginService.server";

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const user = ref<unknown>(null);

const loginService = useLoginService("auth");

const submit = async () => {
  error.value = null;
  loading.value = true;
  try {
    const res = await loginService.login({
      username: username.value,
      password: password.value,
    });
    user.value = res;
  } catch (err) {
    error.value = String(err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container" style="max-width: 480px; margin: 4rem auto; padding: 1rem">
    <h1>Playground Login</h1>
    <form aria-label="login form" @submit.prevent="submit">
      <div style="margin-bottom: 0.5rem">
        <label for="username">Username</label><br />
        <input id="username" v-model="username" type="text" required />
      </div>
      <div style="margin-bottom: 0.5rem">
        <label for="password">Password</label><br />
        <input id="password" v-model="password" type="password" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? "Logging in…" : "Login" }}
      </button>
    </form>

    <div v-if="error" style="color: red; margin-top: 1rem">Error: {{ error }}</div>

    <div v-if="user" style="margin-top: 1rem">
      <h2>Logged in user</h2>
      <pre>{{ user }}</pre>
    </div>
  </div>
</template>
