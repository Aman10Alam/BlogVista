
import { initializeApp } from "firebase/app";
import {GoogleAuthProvider, getAuth, signInWithPopup} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBrjz3UCf4rwKdb60yH-Sdt1KbDcuQvIDM",
  authDomain: "blogvista-45c3a.firebaseapp.com",
  projectId: "blogvista-45c3a",
  storageBucket: "blogvista-45c3a.appspot.com",
  messagingSenderId: "676743557752",
  appId: "1:676743557752:web:8fef94fc308ae3e349f38d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//google Auth
const provider =new GoogleAuthProvider();

const auth=getAuth();

export const authWithGoogle = async ()=>{
    let user= null;

    await signInWithPopup(auth,provider) // it will give pop up window to sign in using google
    .then((result)=>{
        user=result.user;
    })
    .catch((err)=>{
        console.log(err);
    })

    return user;
}