<template>
  <div class="min-h-screen">
    <header class="border-b border-gray-800 px-8">
      <nav class="mx-auto flex max-w-7xl items-center justify-between h-16">
        <NuxtLink to="/" class="text-xl font-bold text-white no-underline">
          NHL App
        </NuxtLink>
        <div class="flex gap-6">
          <NuxtLink
            to="/teams"
            class="text-gray-400 no-underline font-medium transition-colors hover:text-white"
          >
            Teams
          </NuxtLink>
        </div>
      </nav>
    </header>
    <main class="mx-auto max-w-7xl p-8">
      <slot />
    </main>
  </div>
</template>
