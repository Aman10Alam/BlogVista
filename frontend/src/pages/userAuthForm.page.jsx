import AnimationWrapper from "../common/page-animation"
import InputBox from "../components/input.component"
import googleIcon from "../imgs/google.png"
import { Link } from "react-router-dom"
<<<<<<< HEAD

const User= ({type})=>{
=======
import { useRef } from "react"
import {Toaster,toast} from "react-hot-toast"

const UserAuthForm= ({type})=>{
   
  const authForm= useRef();// react hook to access html element data

   const handleSubmit= (e)=>{
     e.preventDefault();

     let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
     let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password
     
     let form=new FormData(authForm.current);//to get data from the Form
     let formData= {};

     for(let [key,value] of form.entries()){// to iterate through the fields of the data and then store on a different object
       formData[key]=value;
     }
     
     let {fullname,email,password}= formData;//destructure the data

     if(fullname){
        if(fullname.length < 3){
        return toast.error("Fullname must be at least 3 letters long")
        }
    }
      if(!email.length){
          return toast.error("Email is required")
      }
      
      
      if(!emailRegex.test(email)){// checking whether email follows a acertain pattern or not
          return toast.error( "Invalid Email Address");
      }

      if(!passwordRegex.test(password)){
          return toast.error("Password should be 6 to 20 characters long with 1 numeric,1 lowercase and 1 uppercase letters")
      }



     console.log(formData);
   }
>>>>>>> 6c7bd02 (changes due to mongo db error)
    return(
        <>
        <AnimationWrapper keyValue={type}>
          <section className="h-cover flex items-center justify-center">
<<<<<<< HEAD
              <form className="w-[80%] max-w-[400px]">
=======
            <Toaster/>
              <form ref={authForm} className="w-[80%] max-w-[400px]">
>>>>>>> 6c7bd02 (changes due to mongo db error)
                <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                  {type == "sign-in" ? "Welcome back":"Join us today"}
                </h1>

                {
                  type != "sign-in"?
                    <InputBox 
                      name="fullname"
                      type="text"
                      placeholder="Full Name"
                      icon="fi-rr-user"
                    />
                  :""
                }

                <InputBox 
                  name="email"
                  type="email"
                  placeholder="Email"
                  icon="fi-rr-envelope"
                />

                <InputBox 
                  name="password"
                  type="password"
                  placeholder="Password"
                  icon="fi-rr-key"
                />

<<<<<<< HEAD
                <button className="btn-dark center mt-14" type="submit">
=======
                <button className="btn-dark center mt-14" type="submit"
                onClick={handleSubmit}>
>>>>>>> 6c7bd02 (changes due to mongo db error)
                  {type.replace("-"," ")}
                </button>

                <div className="relative w-full flex items-center gap-2 my-10
                opacity-10 uppercase text-black font-bold">
                  <hr  className="w-1/2 border-black"/>
                  <p>or</p>
                  <hr  className="w-1/2 border-black"/>
                </div>
                
                <button className="btn-dark flex items-center justify-center
                gap-4 w-[90%] center">
                  <img src={googleIcon} className="w-5"/>
                  continue with google
                </button>

                {
                    type=="sign-in"?
                    <p className="mt-6 text-dark-grey text-xl text-center">
                      Don't have an account?
                      <Link to="/signup" className="underline text-black
                      text-xl ml-1">
                        Join us today
                      </Link>
                    </p>
                    :
                    <p className="mt-6 text-dark-grey text-xl text-center">
                    Already a member?
                    <Link to="/signin" className="underline text-black
                    text-xl ml-1">
                      Sign in here
                    </Link>
                    </p>
                }

              </form>
          </section>
        </AnimationWrapper>

         
        </>
    )
}

<<<<<<< HEAD
export default User
=======
export default UserAuthForm
>>>>>>> 6c7bd02 (changes due to mongo db error)
