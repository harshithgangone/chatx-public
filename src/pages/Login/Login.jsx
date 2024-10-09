import React, { useState } from 'react'
import "./Login.css"
import assets from "../../assets/assets"
import { signup,login,resetPass,loginWithGoogle} from '../../config/firebase'

const Login = () => {
  const [currState,setCurrState]=useState("Sign up");
  const [userName,setUserName]=useState("");
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")

  const onSubmithandler=(event)=>{
    event.preventDefault();
    if(currState==="Sign up"){
      signup(userName,email,password);
    }
    else{
      login(email,password)
    }
  }
  return (
    <div className='login'>
      <img src={assets.logo_big} alt="Logo" className='logo' />
      <form onSubmit={onSubmithandler} className='login-form'>
        <h2>{currState}</h2>
        {currState==="Sign up"?<input onChange={(e)=>setUserName(e.target.value)} value={userName} type="text" placeholder='username' className="form-input" required />:null}
        <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' className="form-input" required/>
        <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Password' className="form-input" required />
        <button type='submit'>{currState==="Sign up"?"Create Account":"Login"}</button>
        <label htmlFor="google">Or continue with - <br />
          <img className='google' id='google' onClick={loginWithGoogle} src={assets.google_logo} alt="" />
        </label>
        <div className="login-term">
          <input type="checkbox" />
          <p>Agree To the Terms of Use & Privacy Policy.</p>
        </div>
        <div className="login-forgot">
          {currState==="Sign up"
          ?<p className='login-toggle'>Already Have an Account? <span onClick={()=>setCurrState("Login")}>Login here</span></p>
          :<p className='login-toggle'>Create an account <span onClick={()=>setCurrState("Sign up")}>Click here</span></p>
          }
          {currState==="Login"?<p className='login-toggle'>Forgot Password? <span onClick={()=>resetPass(email)}>Reset here</span></p>:null}
          </div>
      </form>
    </div>
  )
}

export default Login
