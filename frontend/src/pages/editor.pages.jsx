import { createContext, useContext ,useState} from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";


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
   
    let {userAuth:{access_token}}=useContext(UserContext)

    return(
        <EditorContext.Provider value={{blog,setBlog,editorState,setEditorState,textEditor,setTextEditor}}>
            {
                access_token == null ? <Navigate to="/signin"/>
                : editorState == "editor"? <BlogEditor/>: <PublishForm/>
            }
        </EditorContext.Provider>
    )
}

export default Editor;