import {useQuery} from '@pinia/colada'
import type {Item} from '#shared/types/index'

export default function useItems(type:Ref<string>,limit:Ref<number>){
    const url = '/api/items';
    
    const {data,isLoading,error} = useQuery({
        key:() => ['items',limit.value,type.value],
        query:async()=>{
            const res = await $fetch<{data:Item[]}>(url,{
                query:{limit,type}
            })
            return res.data
        }
    })


    return{data,isLoading,error}
}


