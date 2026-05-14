import { z } from 'zod';
import { db } from '#server/db/index'
import {usersTable} from '#server/db/schema'
import {eq} from 'drizzle-orm'

const loginSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8)
})


export default defineEventHandler(async(event)=>{
    const body = await readBody(event);
    const parsedBody = loginSchema.safeParse(body);

    if(!parsedBody.success){
        throw createError({
            statusCode:422,
            message:"Validation error",
            data:parsedBody.error.flatten(),
        }) 
    }

    const user = await db.select().from(usersTable).where(eq(usersTable.email,parsedBody.data!.email))

    if(user.length===0){
        throw createError({
            statusCode:404,
            message:'User email not found'
        })
    }
    if(user[0]!.passwordHash == null) throw createError({statusCode:404,message:'User registrated with OAuth'})
    if(await verifyPassword(user[0]!.passwordHash,parsedBody.data!.password)){
        const currentUser = user[0]!;
        await setUserSession(event,{user:{id:currentUser.id,email:currentUser.email}})
        return{success:true}
    }
    throw createError({
        statusCode:404,
        message:'Password is incorrect'
    })
})