<template>

<div>

    <img :src="img">
    <div class="text">
        <h2>{{ props.item.title }}</h2>
        <h3>{{ props.item.description }}</h3>
        <p>Type: <span>{{ props.item.type }}</span>  Status: <span>{{ props.item.status }}</span></p>
    </div>
    
</div>

</template>


<script setup lang="ts">
import type {Item} from '#shared/types/index'


const props = defineProps<{item:Item}>()


const img = computed(()=>{
    return props.item.imageUrl ? props.item.imageUrl : '#'
})


</script>