<template>
  <div class="home">
    <h1>NHL App</h1>
    <p>Hokejové statistiky, týmy a zápasy</p>
    <NuxtLink to="/teams" class="cta">Zobrazit týmy</NuxtLink>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.home h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.home p {
  color: #888;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.cta {
  background: #fff;
  color: #000;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}

.cta:hover {
  opacity: 0.85;
}
</style>
