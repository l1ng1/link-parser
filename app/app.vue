<template>
  <div>
    <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    </UApp>
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (title) => (title ? `${title} – link-parsser` : 'link-parsser'),
})
</script>
