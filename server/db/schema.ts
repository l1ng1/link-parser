
import { integer, pgTable, text, timestamp, } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users",{
    id:integer().primaryKey().generatedAlwaysAsIdentity(),
    email:text().notNull().unique(),
    passwordHash:text(),
    createdAt:timestamp().notNull().defaultNow(),
})


export const oauthAccountsTable = pgTable("oauth_accounts",{
    id:integer().primaryKey().generatedAlwaysAsIdentity(),
    userId:integer().notNull().references(()=>usersTable.id),
    provider:text().notNull(),
    providerAccountId: text().notNull(),
    createdAt:timestamp().notNull().defaultNow(),
})

export const itemsTable = pgTable('items',{
    id:integer().primaryKey().generatedAlwaysAsIdentity(),
    userId:integer().notNull().references(()=>usersTable.id),
    url:text().notNull(),
    title:text(),
    description:text(),
    imageUrl:text(),    
    type:text(),
    content:text(),
    status:text().notNull().default('pending'),
    createdAt:timestamp().notNull().defaultNow()
})
    

