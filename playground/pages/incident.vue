<script lang="ts" setup>
import IncidentCard from '~/components/IncidentCard.vue'
import { useUserStore } from '~/stores/useUserStore'
import type { Incident } from '~/types'

const userStore = useUserStore()
const id = ref('PDQ-lJUB8RzXNeUDGOq3')
const incidentService = useSingleQuery<Incident, string>('incidents', id, userStore.user?.token)
const onClick = async () => {
  id.value = 'INCIDENT-1'
}
</script>

<template>
  <div class="p-grid">
    <div class="p-col">
      <h1>Incident</h1>
      <InputText
        v-model="id"
        placeholder="Incident ID"
        class="p-mb-2"
        :style="{ width: '300px' }"
      />
    </div>
    <div class="p-col">
      <div v-if="incidentService.read.isFetching.value">
        <p>Loading...</p>
      </div>
      <div v-else-if="incidentService.read.isError.value">
        <p>Error: {{ incidentService.read.error.value?.message }}</p>
      </div>
      <IncidentCard
        v-else
        :incident="incidentService.read.data.value!"
      />
      <Button
        label="Click me!"
        icon="pi pi-check"
        class="p-button-success"
        @click="onClick"
      />
    </div>
  </div>
</template>

<style></style>
