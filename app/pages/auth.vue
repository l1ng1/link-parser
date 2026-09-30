<template>

    <UForm @submit="onSubmit" :schema="loginSchema" :state="state">
        <p class="text-red-500">{{ errorMessage }}</p>
        <UFormField label="Email" name="email">
            <UInput v-model="state.email" />
        </UFormField>
        <UFormField label="Password" name="password">
            <UInput v-model="state.password" type="password" />
        </UFormField>

        <UButton :loading="isLoading" type="submit">
            {{ status }}
        </UButton>
        <p>Нет аккаунта?<span @click="status = 'register'">Заргестрируйся!</span></p>
    </UForm>

</template>
<script setup lang="ts">
import {z} from 'zod';
type typeOfForm = 'login'|'register'
const status = ref<typeOfForm>('login')
const loginSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8)
})
const errorMessage = ref('')
const { fetch: refreshSession } = useUserSession()
type Schema = z.output<typeof loginSchema>

const state = reactive<Partial<Schema>>({
    email:undefined,
    password:undefined,
})

const {mutateAsync,isLoading} = useMutation({mutation:(payload:{url:string,body:Partial<Schema>})=>$fetch(payload.url,{method:'POST',body:payload.body}) })


const onSubmit = async ()=>{
    let url;
    errorMessage.value = '';
    if(status.value === 'login'){
        url = '/api/auth/login'
    } else{
        url = '/api/auth/register'
    }
    try{
        await mutateAsync({url:url,body:state})
        await refreshSession()
        await navigateTo('/')
    }catch(e){
        console.log(e)
        errorMessage.value = 'something went wrong';
    }
    
    
}








</script>