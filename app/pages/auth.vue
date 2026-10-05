<template>

    <UForm  :schema="loginSchema" :state="state" @submit="onSubmit">
        <UFormField label="Email" name="email">
            <UInput v-model="state.email" />
        </UFormField>
        <UFormField label="Password" name="password">
            <UInput v-model="state.password" type="password" />
        </UFormField>
        <UAlert v-if="errorMessage !== ''" color="error" :description="errorMessage" />
        <UButton :loading="isLoading" type="submit">
            {{ vars[status].submit }}
        </UButton>
        <p>{{vars[status].text}}
            <UButton 
            variant="link" 
            type="button" 
            @click="status = status==='login'?'register':'login';errorMessage = ''">
            {{ vars[status].textLink }}
        </UButton>
        </p>
        
    </UForm>

</template>
<script setup lang="ts">
import {z} from 'zod';
import {FetchError} from 'ofetch';
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

const vars = {
    'login':{submit:'Log in',text:'Dont have an account?',textLink:'Create!'},
    'register':{submit:'Register',text:'Already have an account?',textLink:'Log in!'}
}



const {mutateAsync,isLoading} = useMutation({mutation:(payload:{url:string,body:Partial<Schema>})=>$fetch(payload.url,{method:'POST',body:payload.body}) })


const onSubmit = async ()=>{
    errorMessage.value = '';
    const url = status.value === 'login' ? '/api/auth/login':'/api/auth/register' 
    try{
        await mutateAsync({url:url,body:state});
        await refreshSession();
        await navigateTo('/');
    }catch(e){
        if(e instanceof FetchError){
            errorMessage.value = e.data?.message ?? 'Something went wrong';
        }else{
            errorMessage.value = 'Something went wrong';
        }
        
    }
}



definePageMeta({
    layout:false,
})




</script>