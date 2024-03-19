// importing tools

import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import  ImageTool from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote"
import Marker from "@editorjs/marker"
import InlineCode from "@editorjs/inline-code";
import { uploadImage } from "../common/aws";


const uploadImageByUrl= (e) =>{
    let link = new Promise((resolve,reject)=>{
        try{
            resolve(e)
        }
        catch(err){
            reject(err)
        }
    })

    return link.then(url =>{
        return{
            success:1,
            file: { url },
        }
    })
}

const uploadImageByFile=(e)=>{
    return uploadImage(e).then( url => {
        if(url){
            return {
                success: 1,
                file: { url }
            }
        }
    })
}

  const tools = {
    embed: Embed,
    list: {
        class:List,
        inlineToolBar: true,
    },
    image:{
        class: ImageTool,
        config: {
            uploader: {
                uploadByUrl: uploadImageByUrl ,
                uploadByFile: uploadImageByFile ,
            }
            
        }
    },
    header:{
        class: Header,
        config: {
            placeholder: "Type Heading ....",
            levels: [2,3],
            defaultLevel: 2,
        }
    },
    quote:{
        class: Quote,
        inlineToolBar: true,
    },
    marker: Marker,
    inlinecode: InlineCode
}

export default tools;