import { z } from 'zod'
import {db} from '#server/db/index'
import {itemsTable} from '#server/db/schema'
import {eq,and,desc} from 'drizzle-orm'

const querySchema = z.object({
    type: z.enum(['article', 'video']).optional().catch(undefined),
    limit: z.coerce.number().int().min(1).max(100).catch(20),
})

export default defineEventHandler(async (event)=>{
    const user = await requireUserSession(event);
    const query = querySchema.parse(getQuery(event));
    const conditions = [eq(itemsTable.userId,user.user.id)]
    if(query.type) conditions.push(eq(itemsTable.type,query.type));

    // The list doesn't need the article text, and it can be large, so it stays out.
    const data = await db.select({
        id: itemsTable.id,
        userId: itemsTable.userId,
        url: itemsTable.url,
        title: itemsTable.title,
        description: itemsTable.description,
        imageUrl: itemsTable.imageUrl,
        type: itemsTable.type,
        status: itemsTable.status,
        createdAt: itemsTable.createdAt,
    })
        .from(itemsTable)
        .where(and(...conditions))
        .orderBy(desc(itemsTable.createdAt))
        .limit(query.limit)

    return{
        data:data
    }

})
