import { createContext, useContext ,useState, useEffect} from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import history from "../history.jsx";
import { lookInSession } from "../common/session";

const blogStructure= {
    title:'',
    banner:'',
    content:[],
    tags:[],
    des:'',
    author: {personal_info:{}}
}

export const EditorContext= createContext({});

const Editor=()=>{

    const [blog, setBlog] = useState(blogStructure);
    const [editorState,setEditorState] = useState("editor");
    const [textEditor,setTextEditor] = useState({isReady: false});// editor js has an isReadykey inside the object inside class to validate we have editor ready to type or not (we will check this in useffect while creating editor so that it wont create another editor)
   
    //let {userAuth:{access_token}}=useContext(UserContext)

    let userInSession=JSON.parse(lookInSession("user"));

    useEffect(()=>{
      //console.log(userInSession.access_token);
    },[])
    
    return(
        <>
            
           <EditorContext.Provider value={{blog,setBlog,editorState,setEditorState,textEditor,setTextEditor}}>
            {   
                
                !(userInSession) ? <Navigate to="/signin"/>
                : editorState == "editor"? <BlogEditor/>: <PublishForm/>
                 
                //  true? <Navigate to="/signin"/>
                //  : editorState == "editor"? <BlogEditor/>: <PublishForm/>

                
            }
        </EditorContext.Provider>
        </>
        
    )
}

export default Editor;