<script setup lang="ts">
defineProps<{
  id: number;
  fullName: string;
  triCode: string;
  logo?: string | null;
  divisionName?: string | null;
}>();
</script>

<template>
  <NuxtLink
    :to="`/teams/${id}`"
    class="flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-800 bg-gray-900 transition-all hover:border-gray-600 cursor-pointer"
  >
    <img
      v-if="logo"
      :src="logo"
      :alt="fullName"
      class="w-20 h-20 object-contain"
    />
    <div class="text-center">
      <div class="font-semibold">{{ fullName }}</div>
      <div class="text-sm text-gray-400">{{ triCode }}</div>
      <div v-if="divisionName" class="text-xs text-gray-600 mt-0.5">
        {{ divisionName }}
      </div>
    </div>
  </NuxtLink>
</template>
