import { z } from 'zod';
import { db } from '#server/db/index'
import {itemsTable} from '#server/db/schema'
import {eq,and} from 'drizzle-orm'

const idSchema = z.coerce.number().int().positive().max(2147483647)

export default defineEventHandler(async (event)=>{
    const params = getRouterParam(event,'id')

    const checked = idSchema.safeParse(params);

    if(!checked.success) throw createError({statusCode:422,message:"ID of entry is invalid"})
    const {user} = await requireUserSession(event);
    const conditions = [eq(itemsTable.id,checked.data),eq(itemsTable.userId,user.id)]

    const result = await db.delete(itemsTable).where(and(...conditions)).returning()
    if(result.length<1) throw createError({statusCode:404,message:"Can't delete entry with this ID"})
    return {success:true}

})

