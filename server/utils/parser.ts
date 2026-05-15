import {ofetch} from 'ofetch';
import {parse} from 'node-html-parser'
export default async function linkParser(url:string){

    if(url.includes('youtube.com') || url.includes('youtu.be')){
        try{
            const res = await ofetch(`https://www.youtube.com/oembed?url=${url}&format=json`);
        return{
                data:{
                title:res.title,
                imageUrl:res.thumbnail_url,
                description:res.description
            },
            type:'video'
        }
        }
        catch{
            throw new Error('Url is unreachable')
        }
        
    }
try{
    const res = await ofetch(url);
    const htmlString = parse(res);
    const title = htmlString.querySelector('meta[property="og:title"]')?.getAttribute('content')
    const image = htmlString.querySelector('meta[property="og:image"]')?.getAttribute('content')
    const description = htmlString.querySelector('meta[property="og:description"]')?.getAttribute('content')


    return{ data:{
        title:title,
        imageUrl:image,
        description:description
    },
        type:'article'
    }
}
catch{
    throw new Error('Url is unreachable')
}

}