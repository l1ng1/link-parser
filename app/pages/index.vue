<template>

    <div>
        <select v-model='type'>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="">All</option>
        </select>

        <select v-model.number='limit'>
            <option value="10">10</option>
            <option value="20">20</option>
        </select>

        <div v-if="isLoading">...loading</div>
        <div v-if="error">{{ error }}</div>
        <div class="items">
            <div v-for="item in data" :key="item.id" class="item">
                <ItemCard @delete="handleDelete" :item="item"></ItemCard>
            </div>
        </div>

        <AddItemForm></AddItemForm>



    </div>  


</template>
<script setup lang="ts">
const limit = ref(10);
const type = ref("")

const {data,isLoading,error} = useItems(type,limit);
const {mutateAsync:removeItem,cache} = useDeleteItem()

async function handleDelete(id:number){
    if(!confirm('Are you sure want to delete this item?')) return
    if(id<0) return
    try{
        await removeItem(id);
        await cache.invalidateQueries({key:['items']})
    }catch(e){
        console.log(e)
    }
}


</script>