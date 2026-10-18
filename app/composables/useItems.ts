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
        },
        autoRefetch:(state)=>{
            if(!state.data) return false
            for(const i in state.data){
                if(state.data[i].status == 'pending'){
                    const isFresh = Date.now() -  new Date(state.data[i].createdAt).getTime() <60_000;
                    if(isFresh){
                        return 3000
                    }
                    continue
                }
                else{
                    continue
                }
            }
            return false
        }
    })


    return{data,isLoading,error}
}


