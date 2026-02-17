<template>
  <div class="flex flex-col items-center justify-center min-h-[75vh] select-none">
    <h1 class="engraved-text text-[10rem] font-black leading-none tracking-tighter">
      NHL
    </h1>
    <p class="text-gray-500 text-lg mt-4 tracking-widest uppercase">
      Statistics &middot; Teams &middot; Games
    </p>
  </div>
</template>

<style scoped>
.engraved-text {
  color: transparent;
  background: linear-gradient(to bottom, #1a1a2e, #0f0f1a);
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04),
    0 -1px 0 rgba(0, 0, 0, 0.7);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  font-family: 'Arial Black', 'Impact', sans-serif;
}
</style>
