import {useQuery} from '@pinia/colada'
import type {Item} from '#shared/types/index'

// One saved item with its article text, for the reader page.
// The key starts with 'item', not 'items', so invalidating the library list
// after a delete doesn't refetch a detail page whose item is already gone.
export default function useItem(id:Ref<number>){
    const requestFetch = useRequestFetch()
    return useQuery({
        key:() => ['item',id.value],
        query:async()=>{
            const res = await requestFetch<{data:Item}>(`/api/items/${id.value}`)
            return res.data
        },
        autoRefetch:(state)=>{
            if(!state.data) return false
            return isStillParsing(state.data) ? 3000 : false
        }
    })
}
