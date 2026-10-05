import {useQuery} from '@pinia/colada'
import type {Item} from '#shared/types/index'

export default function useItems(type:Ref<string>,limit:Ref<number>){
    const url = '/api/items';
    const requestFetch = useRequestFetch()
    const {data,isLoading,error} = useQuery({
        key:() => ['items',limit.value,type.value],
        query:async()=>{
            const res = await requestFetch<{data:Item[]}>(url,{
                query:{limit:limit.value,type:type.value}
            })
            return res.data
        }
    })


    return{data,isLoading,error}
}


