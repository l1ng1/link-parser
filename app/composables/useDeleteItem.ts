
export default function useDeleteItem(){

    const cache = useQueryCache();
    const {mutateAsync} = useMutation({mutation:(id:number) => $fetch(`/api/items/${id}`,{method:'DELETE'}) })

    return {mutateAsync,cache}

}