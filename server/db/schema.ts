import { integer, pgTable, text, timestamp, } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users",{
    id:integer().primaryKey().generatedAlwaysAsIdentity(),
    email:text().notNull().unique(),
    passwordHash:text(),
    createdAt:timestamp().notNull().defaultNow(),
})