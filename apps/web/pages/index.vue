<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <h1 class="text-5xl font-extrabold mb-2">NHL App</h1>
    <p class="text-gray-400 text-lg mb-8">
      Hokejové statistiky, týmy a zápasy
    </p>
    <NuxtLink to="/teams">
      <Button label="Zobrazit týmy" severity="contrast" size="large" />
    </NuxtLink>
  </div>
</template>
