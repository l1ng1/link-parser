<template>

 
<div>
    <input v-model="inputVal" type="text">
    <button :disabled="isLoading" @click="ipLoadLink">Create article</button>

    <p v-if="messageError">{{ messageError }}</p>
    
</div>


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
    if(inputVal.value.length<1) return messageError.value="Input value can not be empty"
    try{
        await mutateAsync(inputVal.value);
        await cache.invalidateQueries({key:['items']})
        inputVal.value = '';
    }
    catch(e){
      if(e instanceof FetchError){
            messageError.value = e.data?.message ?? "Failed to add link";
        }else{
            messageError.value = "Failed to add link";
        }
    }
}




</script>