import { db } from '#server/db/index'
import {usersTable,oauthAccountsTable} from '#server/db/schema'
import {eq,and} from 'drizzle-orm'


export default defineOAuthGitHubEventHandler({
    config: {
        emailRequired:true
    },
    async onSuccess(event,{user}){
        if (!user.email) {
        throw createError({
            statusCode: 400,
            message: 'Email is required. Please make your email public on GitHub.'
            })
        }
        const isUser = await db.select().from(oauthAccountsTable).where(and(
            eq(oauthAccountsTable.providerAccountId,user.id.toString()),
            eq(oauthAccountsTable.provider, 'github')
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
                    provider:'github',
                    providerAccountId:user.id.toString()
                })

                await setUserSession(event,{user:{
                    id:isUser[0]!.id,
                    email:isUser[0]!.email
                }})

            }
            else{
                const data = await db.insert(usersTable).values({
                    email:user.email
                }).returning()

                await db.insert(oauthAccountsTable).values({
                    userId:data[0]!.id,
                    provider:'github',
                    providerAccountId:user.id.toString()
                })

                await setUserSession(event,{user:{
                    id:data[0]!.id,
                    email:data[0]!.email
                }})

            }
        }
    },
    onError(event,error){
        throw error
    }

})