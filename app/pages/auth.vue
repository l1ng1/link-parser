<template>

    <div class="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-12">
        <p class="font-serif text-2xl italic text-highlighted">link-parsser</p>
        <h1 class="mt-6 font-serif text-3xl leading-tight font-semibold text-highlighted">{{ vars[status].heading }}</h1>
        <p class="mt-2 text-muted">Save articles and videos, then read them later without the clutter.</p>

        <UForm :schema="loginSchema" :state="state" class="mt-8 space-y-4" @submit="onSubmit">
            <UFormField label="Email" name="email">
                <UInput v-model="state.email" type="email" autocomplete="email" size="lg" class="w-full" />
            </UFormField>
            <UFormField label="Password" name="password" :hint="status === 'register' ? 'At least 8 characters' : undefined">
                <UInput
                    v-model="state.password"
                    type="password"
                    :autocomplete="status === 'register' ? 'new-password' : 'current-password'"
                    size="lg"
                    class="w-full"
                />
            </UFormField>

            <p v-if="errorMessage !== ''" class="border-l-2 border-(--ui-text-highlighted) pl-3 text-sm text-highlighted" role="alert">{{ errorMessage }}</p>

            <UButton :loading="isLoading" type="submit" size="lg" block>
                {{ vars[status].submit }}
            </UButton>
        </UForm>

        <p class="mt-4 text-sm text-muted">{{vars[status].text}}
            <button
                type="button"
                class="text-highlighted underline underline-offset-4"
                @click="status = status==='login'?'register':'login';errorMessage = ''"
            >{{ vars[status].textLink }}</button>
        </p>

        <div class="my-8 flex items-center gap-3 text-sm text-dimmed">
            <span class="h-px flex-1 bg-(--ui-border)" />
            or
            <span class="h-px flex-1 bg-(--ui-border)" />
        </div>

        <div class="grid gap-3">
            <UButton to="/auth/github" external variant="outline" color="neutral" size="lg" icon="i-simple-icons-github" block>Continue with GitHub</UButton>
            <UButton to="/auth/google" external variant="outline" color="neutral" size="lg" icon="i-simple-icons-google" block>Continue with Google</UButton>
        </div>
    </div>

</template>
<script setup lang="ts">
import {z} from 'zod';
import {FetchError} from 'ofetch';
type typeOfForm = 'login'|'register'
const status = ref<typeOfForm>('login')
const loginSchema = z.object({
    email:z.string().email('Enter a valid email'),
    password:z.string().min(8, 'Use at least 8 characters')
})
const errorMessage = ref('')
const { fetch: refreshSession } = useUserSession()
type Schema = z.output<typeof loginSchema>

const state = reactive<Partial<Schema>>({
    email:undefined,
    password:undefined,
})

const vars = {
    'login':{heading:'Log in',submit:'Log in',text:"Don't have an account?",textLink:'Create one'},
    'register':{heading:'Create an account',submit:'Create account',text:'Already have an account?',textLink:'Log in'}
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

useHead({ title: () => vars[status.value].heading })



</script>
