<template>

    <div>
        <select v-model='type'>
            <option value="article">Article</option>
            <option value="video">Video</option>
        </select>

        <select v-model.number='limit'>
            <option value="0">0</option>
            <option value="10">10</option>
            <option value="20">20</option>
        </select>

        <div v-if="isLoading">...loading</div>
        <div v-if="error">{{ error }}</div>
        <div class="items">
            <div v-for="item in data" :key="item.id" class="item">
                <ItemCard :item="item"></ItemCard>
            </div>
        </div>
    </div>  


</template>
<script setup lang="ts">
import useItems from '../composables/useItems'

const limit = ref(0);
const type = ref("article")

const {data,isLoading,error} = useItems(type,limit);


</script>