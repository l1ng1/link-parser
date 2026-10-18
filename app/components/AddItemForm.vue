<template>

<form class="pt-10 sm:pt-14" @submit.prevent="ipLoadLink">
    <label for="new-link" class="block text-sm text-muted">Save an article or a YouTube video</label>
    <div class="mt-2 flex items-end gap-3 border-b-2 border-(--ui-text-highlighted) pb-2">
        <input
            id="new-link"
            v-model="inputVal"
            type="text"
            inputmode="url"
            autocomplete="off"
            placeholder="Paste a link"
            class="min-w-0 flex-1 bg-transparent font-serif text-2xl text-highlighted placeholder:text-dimmed focus:outline-none sm:text-3xl"
        >
        <UButton type="submit" :loading="isLoading" size="lg" class="shrink-0">Save</UButton>
    </div>

    <p v-if="messageError" class="mt-3 text-sm text-highlighted" role="alert">{{ messageError }}</p>
</form>


</template>
<script setup lang="ts">
import {useMutation} from '@pinia/colada'
import {FetchError} from 'ofetch';
const inputVal = ref('');
const messageError = ref('')
const { mutateAsync , isLoading } = useMutation({
  mutation: (link: string) => $fetch('/api/items',{
    method: 'POST',
    body: {
      url:link
    },
  }),
})

const cache = useQueryCache()

const ipLoadLink = async ()=>{
    messageError.value = ''
    const link = inputVal.value.trim()
    if(link.length<1) return messageError.value="Paste a link first"
    try{
        await mutateAsync(link);
        await cache.invalidateQueries({key:['items']})
        inputVal.value = '';
    }
    catch(e){
      if(e instanceof FetchError){
            messageError.value = e.data?.message ?? "Couldn't save this link. Try again.";
        }else{
            messageError.value = "Couldn't save this link. Try again.";
        }
    }
}




</script>
