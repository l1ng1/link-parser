import { z } from 'zod';
import { db } from '#server/db/index'
import {itemsTable} from '#server/db/schema'
import linkParser from '#server/utils/parser'
import {eq} from 'drizzle-orm'



const urlSchema = z.object({
    url:z.string().url()
})

export default defineEventHandler(async (event)=>{
    const body =await readBody(event);
    const parsedBody = urlSchema.safeParse(body);
    if(!parsedBody.success) throw createError({statusCode:422,message:"Url is invalid"})
    const user = await requireUserSession(event);
    const data = await db.insert(itemsTable).values({
        userId:user.user.id,
        url:parsedBody.data.url,
    }).returning()


    const item = data[0]!;

    linkParser(item.url).then(async(obj)=>{
        try{
            await db.update(itemsTable)
            .set({
                title:obj.data.title,
                description:obj.data.description,
                imageUrl:obj.data.imageUrl,
                type:obj.type,
                status:'ready',

            })
            .where(eq(itemsTable.id,item.id))
        }catch{
            await db.update(itemsTable)
            .set({
                status:'failed'
            })
            .where(eq(itemsTable.id,item.id))
            console.error("Url is unreachable")
        }
    })

    return {data:data}

}) 
