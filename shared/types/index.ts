
export interface Item{
    id:number,
    userId:number,
    url:string,
    title:string | null,
    description:string | null,
    imageUrl:string | null,
    type:string | null,
    content:string | null,
    status:string,
    // Dates arrive from the API as ISO strings, not Date objects
    createdAt:string
}

// What the library list returns: everything except the article text
export type ItemSummary = Omit<Item, 'content'>
