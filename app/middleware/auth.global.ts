export default defineNuxtRouteMiddleware((to,from)=>{
    const {loggedIn} = useUserSession();
    if (to.path === '/auth'){
        if(loggedIn.value) return navigateTo('/');        
        return
    } 
    if(!loggedIn.value) return navigateTo('/auth');
    
})