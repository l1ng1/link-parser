<template>

    <div>

        <header v-if="loggedIn">{{ user?.email }} <button @click="exit">Exit</button></header>

        <slot></slot>

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