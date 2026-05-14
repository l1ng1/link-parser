import { db } from '#server/db/index'
import {usersTable,oauthAccountsTable} from '#server/db/schema'
import {eq,and} from 'drizzle-orm'


export default defineOAuthGoogleEventHandler({
    config: {
        emailRequired:true
    },
    async onSuccess(event,{user}){
        
        const isUser = await db.select().from(oauthAccountsTable).where(and(
            eq(oauthAccountsTable.providerAccountId,user.sub),
            eq(oauthAccountsTable.provider, 'google')
        ))

        if(isUser.length>0){
        const userEmail = await db.select().from(usersTable).where(eq(usersTable.id,isUser[0]!.userId))
            await setUserSession(event,{
                user:{
                    id:isUser[0]!.id,
                    email:userEmail[0]!.email
                }
            })
        }
        else{
            const isUser = await db.select().from(usersTable).where(eq(usersTable.email,user.email));
            if(isUser.length>0){
                await db.insert(oauthAccountsTable).values({
                    userId:isUser[0]!.id,
                    provider:'google',
                    providerAccountId:user.sub
                })

                await setUserSession(event,{user:{
                    id:isUser[0]!.id,
                    email:isUser[0]!.email
                }})

                return{success:true}
            }
            else{
                const data = await db.insert(usersTable).values({
                    email:user.email
                }).returning()

                await db.insert(oauthAccountsTable).values({
                    userId:data[0]!.id,
                    provider:'google',
                    providerAccountId:user.sub
                })

                await setUserSession(event,{user:{
                    id:data[0]!.id,
                    email:data[0]!.email
                }})

                return{success:true}

            }
        }
    },
    onError(event,error){
        throw error
    }

})