export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future:{
    compatibilityVersion: 4
  },
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    'nuxt-auth-utils',
    '@pinia/nuxt',
    '@pinia/colada-nuxt'
  ],
  ui:{ fonts:false },
  css:[
    '@fontsource-variable/literata',
    '@fontsource-variable/literata/wght-italic.css',
    '@fontsource-variable/golos-text',
    '@/assets/css/main.css',
  ],
  app:{
    head:{
      htmlAttrs:{ lang:'en' },
      meta:[{ name:'description', content:'Save articles and videos, read them later without the clutter.' }],
    },
  },
  runtimeConfig:{
    databaseUrl:process.env.DATABASE_URL
  },
  nitro: {
  externals: { inline: ['sanitize-html'] },
  },
  devServer: { host: '127.0.0.1' }
})