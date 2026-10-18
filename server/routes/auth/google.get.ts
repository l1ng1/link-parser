import { db } from '#server/db/index'
import {usersTable,oauthAccountsTable} from '#server/db/schema'
import {eq,and} from 'drizzle-orm'


export default defineOAuthGoogleEventHandler({
    config: {
        emailRequired:true
    },
    async onSuccess(event,{user}){
        
        const oauthAccount = await db.select().from(oauthAccountsTable).where(and(
            eq(oauthAccountsTable.providerAccountId,user.sub),
            eq(oauthAccountsTable.provider, 'google')
        ))

        if(oauthAccount.length>0){
        const userEmail = await db.select().from(usersTable).where(eq(usersTable.id,oauthAccount[0]!.userId))
            await setUserSession(event,{
                user:{
                    id:oauthAccount[0]!.userId,
                    email:userEmail[0]!.email
                }
            })
            return sendRedirect(event, '/')
        }
        else{
            const existingUser = await db.select().from(usersTable).where(eq(usersTable.email,user.email));
            if(existingUser.length>0){
                await db.insert(oauthAccountsTable).values({
                    userId:existingUser[0]!.id,
                    provider:'google',
                    providerAccountId:user.sub
                })

                await setUserSession(event,{user:{
                    id:existingUser[0]!.id,
                    email:existingUser[0]!.email
                }})

                return sendRedirect(event, '/')
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

                return sendRedirect(event, '/')

            }
        }
    },
    onError(event,error){
        console.error(error)
        return sendRedirect(event, '/auth')
    }

})