<template>

    <div>
        <AddItemForm />

        <div class="mt-12 flex items-center justify-between gap-4 border-b border-default pb-3">
            <div class="flex gap-5 text-[0.9375rem]" role="group" aria-label="Show">
                <button
                    v-for="option in typeOptions"
                    :key="option.value"
                    type="button"
                    :aria-pressed="type === option.value"
                    class="underline-offset-[6px]"
                    :class="type === option.value ? 'text-highlighted underline decoration-2' : 'text-muted hover:text-highlighted'"
                    @click="type = option.value"
                >{{ option.label }}</button>
            </div>

            <label class="flex items-center gap-2 text-sm text-muted">
                <span class="hidden sm:inline">Show</span>
                <USelect v-model="limit" :items="limitOptions" size="sm" variant="ghost" class="w-16" aria-label="How many to show" />
            </label>
        </div>

        <p v-if="error" class="py-10 text-highlighted" role="alert">Couldn't load your library. Refresh the page to try again.</p>

        <p v-else-if="isLoading && !data" class="py-10 text-muted">Loading your library…</p>

        <div v-else-if="data && data.length === 0" class="py-14">
            <p class="font-serif text-xl text-highlighted">{{ emptyText }}</p>
            <p class="mt-2 text-muted">Paste a link above. The title, picture and text show up here a few seconds later.</p>
        </div>

        <div v-else class="divide-y divide-(--ui-border)">
            <ItemCard v-for="item in data" :key="item.id" :item="item" @delete="handleDelete" />
        </div>
    </div>


</template>
<script setup lang="ts">
const limit = ref(20);
const type = ref("")

const typeOptions = [
    { value: '', label: 'All' },
    { value: 'article', label: 'Articles' },
    { value: 'video', label: 'Videos' },
]
const limitOptions = [10, 20, 50]

const emptyText = computed(()=>{
    if(type.value === 'article') return 'No articles yet.'
    if(type.value === 'video') return 'No videos yet.'
    return 'Your library is empty.'
})

const {data,isLoading,error} = useItems(type,limit);
const {mutateAsync:removeItem,cache} = useDeleteItem()
const toast = useToast()

async function handleDelete(id:number){
    if(!confirm('Remove this item from your library?')) return
    try{
        await removeItem(id);
        await cache.invalidateQueries({key:['items']})
    }catch{
        toast.add({ title: "Couldn't remove the item", description: 'Check your connection and try again.' })
    }
}

useHead({ title: 'Library' })

</script>
