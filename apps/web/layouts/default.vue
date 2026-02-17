<script setup lang="ts">
const collapsed = useState('sidebar-collapsed', () => false);

const navItems = [
  { label: 'Dashboard', icon: 'pi pi-home', to: '/' },
  { label: 'Teams', icon: 'pi pi-users', to: '/teams' },
];
</script>

<template>
  <aside
    class="fixed top-0 left-0 h-screen border-r border-gray-800 flex flex-col transition-all duration-300 bg-gray-950 z-10"
    :class="collapsed ? 'w-16' : 'w-60'"
  >
    <div class="flex items-center h-16 px-4 border-b border-gray-800">
      <NuxtLink to="/" class="flex items-center gap-3 no-underline overflow-hidden">
        <span class="text-xl shrink-0">🏒</span>
        <span
          v-show="!collapsed"
          class="text-lg font-bold text-white whitespace-nowrap"
        >
          NHL App
        </span>
      </NuxtLink>
    </div>

    <nav class="flex-1 py-4 flex flex-col gap-1 px-2">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline text-gray-400 transition-colors hover:bg-gray-800/60 hover:text-white"
        active-class="bg-gray-800 !text-white"
      >
        <i :class="item.icon" class="text-base shrink-0" />
        <span v-show="!collapsed" class="whitespace-nowrap">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="px-2 pb-4">
      <button
        class="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 transition-colors hover:bg-gray-800/60 hover:text-white cursor-pointer bg-transparent border-0"
        @click="collapsed = !collapsed"
      >
        <i
          class="pi text-base shrink-0"
          :class="collapsed ? 'pi-angle-right' : 'pi-angle-left'"
        />
        <span v-show="!collapsed" class="whitespace-nowrap text-sm">Collapse</span>
      </button>
    </div>
  </aside>

  <main
    class="min-h-screen p-8 transition-all duration-300"
    :class="collapsed ? 'ml-16' : 'ml-60'"
  >
    <div class="mx-auto max-w-7xl">
      <slot />
    </div>
  </main>
</template>
