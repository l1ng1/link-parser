export default defineEventHandler(async(event)=>{
    if (!event.path.startsWith('/api/')) return
    if(event.path.startsWith('/api/auth')) return
    const session = await getUserSession(event);
    if (!session.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
})