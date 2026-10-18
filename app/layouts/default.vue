<template>

    <div class="min-h-dvh">

        <header v-if="loggedIn" class="border-b border-default">
            <div class="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
                <NuxtLink to="/" class="font-serif text-lg italic text-highlighted">link-parsser</NuxtLink>
                <div class="flex min-w-0 items-center gap-4 text-sm">
                    <span class="hidden truncate text-muted sm:inline">{{ user?.email }}</span>
                    <button type="button" class="shrink-0 text-highlighted underline-offset-4 hover:underline" @click="exit">Log out</button>
                </div>
            </div>
        </header>

        <main class="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
            <slot />
        </main>

    </div>

</template>


<script setup lang="ts">
import { useQueryCache } from '@pinia/colada'


const cache = useQueryCache()
const {loggedIn,user,clear} = useUserSession()

const exit = async()=>{
    await clear()
    cache.getEntries().forEach((entry)=> cache.remove(entry))
    await navigateTo('/auth');
}

</script>
