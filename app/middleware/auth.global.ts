export default defineNuxtRouteMiddleware((to,from)=>{
    if (to.path === '/auth') return
    const {loggedIn} = useUserSession();
    if(!loggedIn.value) return navigateTo('/auth');
})