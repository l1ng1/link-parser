import {useQuery} from '@pinia/colada'
import type {ItemSummary} from '#shared/types/index'

const FRESH_FOR_MS = 60_000

// An item is worth polling for while its page is still being read, but not forever:
// if parsing silently died, it would stay "pending" and keep the poll running.
export function isStillParsing(item: Pick<ItemSummary,'status'|'createdAt'>){
    return item.status === 'pending' && Date.now() - new Date(item.createdAt).getTime() < FRESH_FOR_MS
}

export default function useItems(type:Ref<string>,limit:Ref<number>){
    const url = '/api/items';
    const requestFetch = useRequestFetch()
    const {data,isLoading,error} = useQuery({
        key:() => ['items',limit.value,type.value],
        query:async()=>{
            const res = await requestFetch<{data:ItemSummary[]}>(url,{
                query:{limit:limit.value,type:type.value || undefined}
            })
            return res.data
        },
        autoRefetch:(state)=>{
            if(!state.data) return false
            return state.data.some(isStillParsing) ? 3000 : false
        }
    })


    return{data,isLoading,error}
}
