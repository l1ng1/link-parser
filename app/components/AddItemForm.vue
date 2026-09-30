<template>

 
<div>
    <input v-model="inputVal" type="text">
    <button @click="ipLoadLink">Create article</button>

    <p v-if="valError">{{ valError }}</p>
    <p v-if="error">{{ error.message }}</p>
</div>


</template>
<script setup lang="ts">
import {useMutation} from '@pinia/colada'
const inputVal = ref('');
const valError = ref('')
const { mutateAsync, error } = useMutation({
  mutation: (link: string) => $fetch('/api/items',{
    method: 'POST',
    body: {
      url:link
    },
  }),
})

const cache = useQueryCache()

const ipLoadLink = async ()=>{
    if(inputVal.value.length<1) return valError.value="Input value can not be empty"
    try{
        await mutateAsync(inputVal.value);
    }
    catch{
        return error
    }
    cache.invalidateQueries({key:['items']})
}




</script>