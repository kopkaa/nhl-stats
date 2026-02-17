import Aura from '@primevue/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  devServer: { port: 3001 },
  modules: ['@primevue/nuxt-module', '@nuxtjs/tailwindcss'],
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark',
        },
      },
    },
  },
  css: ['primeicons/primeicons.css', '~/assets/css/main.css'],
});
