// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/test-utils', '@finema/core', '@nuxtjs/supabase'],
  imports: {
    dirs: ['./constants', './loaders', './types'],
  },
  devtools: {
    enabled: true,
  },
  css: ['./app/assets/css/main.css', '@vuepic/vue-datepicker/dist/main.css'],
  build: {
    transpile: ['@vuepic/vue-datepicker'],
  },
  compatibilityDate: '2025-07-15',
  eslint: {
    config: {
      stylistic: true,
      tooling: true,
    },
  },

  supabase: {
    redirect: false,
  },
})
