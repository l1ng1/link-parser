import {db} from '#server/db/index'
import {itemsTable} from '#server/db/schema'
import {eq,and} from 'drizzle-orm'
export default defineEventHandler(async (event)=>{
    const user = await requireUserSession(event);
    const query = await getQuery(event);
    const conditions = [eq(itemsTable.userId,user.user.id)]
    if(query.type) conditions.push(eq(itemsTable.type,query.type));
    let dbQuery = db.select().from(itemsTable).where(and(...conditions));
    if(query.limit){
        dbQuery = dbQuery.limit(Number(query.limit));
    }

    const data = await dbQuery
        
    return{
        data:data
    }

})