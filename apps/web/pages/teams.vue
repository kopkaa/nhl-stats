<script setup lang="ts">
import { useGetTeamsQuery } from '~/graphql/generated';

const { result, loading, error } = useGetTeamsQuery();

const teams = computed(() => result.value?.teams ?? []);
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">NHL Teams</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <ProgressSpinner />
    </div>

    <Message v-else-if="error" severity="error">
      {{ error.message }}
    </Message>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <Card
        v-for="team in teams"
        :key="team.id"
        class="transition-all hover:border-gray-600 cursor-pointer"
      >
        <template #content>
          <div class="flex flex-col items-center gap-3">
            <img
              v-if="team.logo"
              :src="team.logo"
              :alt="team.fullName"
              class="w-20 h-20 object-contain"
            />
            <div class="text-center">
              <div class="font-semibold">{{ team.fullName }}</div>
              <div class="text-sm text-gray-400">{{ team.triCode }}</div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
