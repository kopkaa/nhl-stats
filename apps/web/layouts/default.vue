<template>
  <div class="app">
    <header class="header">
      <nav class="nav">
        <NuxtLink to="/" class="logo">NHL App</NuxtLink>
        <div class="nav-links">
          <NuxtLink to="/teams">Teams</NuxtLink>
        </div>
      </nav>
    </header>
    <main class="main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #0f0f0f;
  color: #e0e0e0;
  font-family: system-ui, -apple-system, sans-serif;
}

.header {
  border-bottom: 1px solid #222;
  padding: 0 2rem;
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: #999;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #fff;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
