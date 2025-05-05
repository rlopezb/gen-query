<script lang="ts" setup>
import type { Incident } from '~/types'

defineProps<{ incident: Incident }>()
</script>

<template>
  <Card>
    <template #title>
      {{ incident.title }}
    </template>
    <template #subtitle>
      {{ incident.number }}
    </template>
    <template #content>
      <p>{{ incident.user }}</p>
      <p>{{ incident.type ? 'Done' : 'Not done' }}</p>
    </template>
  </Card>
</template>
