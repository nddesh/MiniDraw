import React from 'react';
import "./LoginBar.css"
import gLogo from "../../assets/img/google-logo.png";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export const LoginBar = (props) => {
  
  function login() {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        console.log(user)
        props.onclick({name: user.displayName, image: user.photoURL})
        // window.location.href = "/";
        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
    }
  
  function logOut() {
    props.onclick({name: undefined, image: undefined})
  }

  return (
    <div id="auth">
      { props.user == undefined && 
      <button onClick={() => login()}>       
        <img src={gLogo} alt="Google Logo" height="20px"/>
      Log In with Google</button>}

      { props.user != undefined && <button onClick={() => logOut()}>Log out as {props.user}</button>}
    </div>
  )
}