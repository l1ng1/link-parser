import { z } from 'zod';
import { db } from '#server/db/index'
import {itemsTable} from '#server/db/schema'
import linkParser from '#server/utils/parser'
import { assertSafeUrl, UnsafeUrlError } from '#server/utils/safe-fetch'
import { getYoutubeVideoId } from '#shared/utils/youtube'
import {eq} from 'drizzle-orm'



const urlSchema = z.object({
    url:z.url({ protocol: /^https?$/ }).trim().max(2048)
})

export default defineEventHandler(async (event)=>{
    const body =await readBody(event);
    const parsedBody = urlSchema.safeParse(body);
    if(!parsedBody.success) throw createError({statusCode:422,message:"Paste a full link that starts with http:// or https://"})

    try{
        assertSafeUrl(parsedBody.data.url)
    }catch(e){
        if(e instanceof UnsafeUrlError) throw createError({statusCode:422,message:e.message})
        throw e
    }

    const user = await requireUserSession(event);
    const data = await db.insert(itemsTable).values({
        userId:user.user.id,
        url:parsedBody.data.url,
        type:getYoutubeVideoId(parsedBody.data.url) ? 'video' : 'article',
    }).returning()


    const item = data[0]!;

    linkParser(item.url).then(async(obj)=>{
            await db.update(itemsTable)
            .set({
                title:obj.data.title,
                description:obj.data.description,
                imageUrl:obj.data.imageUrl,
                content:obj.data.content,
                type:obj.type,
                status:'ready',

            })
            .where(eq(itemsTable.id,item.id))

    }).catch(async (err)=>{
        console.error(err)
        await db.update(itemsTable)
            .set({
                status:'failed'
            })
            .where(eq(itemsTable.id,item.id))
    })

    return {data:data}

})
