
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
    createdAt:Date
}
