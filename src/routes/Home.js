import React from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Link } from 'react-router-dom';

import gLogo from '../assets/img/google-logo.png';
import { AuthContext } from '../contexts/authContext';
// import './LoginBar.css';

export const LoginSection = (props) => {
  const { userInfo, setUserInfo } = React.useContext(AuthContext);
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

        setUserInfo({ name: user.displayName, image: user.photoURL });
      })
      .catch((error) => {
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
    props.onclick({ name: undefined, image: undefined });
  }

  return (
    <div id="auth">
      {props.user == undefined && (
        <button onClick={() => login()} style={{ cursor: 'pointer' }}>
          <img src={gLogo} alt="Google Logo" height="20px" />
          Log In with Google
        </button>
      )}

      {props.user != undefined && <button onClick={() => logOut()}>Log out as {props.user}</button>}
    </div>
  );
};

const Home = () => {
  const { userInfo, setUserInfo } = React.useContext(AuthContext);
  // if (!userInfo) {
  //   return (
  //     <div style={{ padding: '72px 0' }}>
  //       <h1 style={{ textAlign: 'center' }}>Welcome to Mini Draw</h1>
  //       <h3 style={{ textAlign: 'center' }}>Login and Let's draw</h3>
  //       <LoginSection />
  //     </div>
  //   );
  // }
  return (
    <div>
      <h1>Homepage</h1>
      <Link to={'/workspaces'}>
        <button>See your Workspaces</button>
      </Link>
    </div>
  );
};

export default Home;
