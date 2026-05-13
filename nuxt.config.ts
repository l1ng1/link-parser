export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future:{
    compatibilityVersion: 4
  },
  modules: ['@nuxt/ui', '@nuxt/eslint'],
  css:['@/assets/css/main.css'],
  runtimeConfig:{
    databaseUrl:process.env.DATABASE_URL
  }
})