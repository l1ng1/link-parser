import { z } from 'zod';
import { db } from '#server/db/index'
import {itemsTable} from '#server/db/schema'
import {eq,and} from 'drizzle-orm'

const idSchema = z.coerce.number().int().positive().max(2147483647)

export default defineEventHandler(async (event)=>{
    const checked = idSchema.safeParse(getRouterParam(event,'id'));
    if(!checked.success) throw createError({statusCode:422,message:"ID of entry is invalid"})

    const {user} = await requireUserSession(event);
    const result = await db.select().from(itemsTable)
        .where(and(eq(itemsTable.id,checked.data),eq(itemsTable.userId,user.id)))
        .limit(1)

    const item = result[0]
    if(!item) throw createError({statusCode:404,message:"Item not found"})
    return {data:item}
})
