import { z } from 'zod';
import { db } from '#server/db/index'
import {usersTable} from '#server/db/schema'
import {eq} from 'drizzle-orm'

const registerSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8)
})

export default defineEventHandler(async(event)=>{
    const body = await readBody(event);
    const parsedBody = registerSchema.safeParse(body);
    if(!parsedBody.success){
        throw createError({
            statusCode:422,
            message:"Validation error",
            data:parsedBody.error.flatten(),
        }) 
    }
    const isRegistered = await db.select().from(usersTable).where(eq(usersTable.email,parsedBody.data.email))
    if(isRegistered.length>0){
        throw createError({
            statusCode:422,
            message:'User with this email address already exists'
        })
    }
    const hashedPassword = await hashPassword(parsedBody.data.password);

    const data = await db.insert(usersTable).values({
        email:parsedBody.data.email,
        passwordHash:hashedPassword,
    }).returning()

    const user = data[0]!;
    await setUserSession(event,{user:{id:user.id,email:user.email}})
    return {success:true}
    

    

})