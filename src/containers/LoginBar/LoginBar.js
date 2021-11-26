import React from 'react';
import "../Auth/Auth.css";
import gLogo from "../../assets/images/google-logo.png";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import "./ControlPanel.css";

export const Auth = (props) => {

  var email = '';
  
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
        email = user.email;
        props.onclick({name: user.displayName, image: user.photoURL, email: email})
        // writeUserData(user.email);
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
    props.onclick({name: undefined, image: undefined, email: undefined})
  }

  function writeUserData(email) {
    let item = {
      "name": "hi2",
      "image": "2_",
      "pic": "20"
    }
    console.log(email)
    db.collection(`${email}`).add(item)
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
