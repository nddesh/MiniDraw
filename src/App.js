import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { FirebaseProvider } from './contexts/firebaseContext';

import './App.css';
import Home from './routes/Home';
import Workspaces from './routes/Workspaces';
import Workspace from './routes/Workspace';

import { LoginBar } from './routes/LoginBar/LoginBar';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { getFirestore, getDoc, doc, collection, setDoc } from 'firebase/firestore';
import { firebaseConfig } from './config';

const app = firebase.initializeApp(firebaseConfig);
const db = getFirestore(app);

const App = (props) => {
  console.log(props.user);
  var [userName, setUserName] = useState();
  var [userImage, setUserImage] = useState();

  let loginName = ({ name, image }) => {
    console.log(props.name);
    setUserName(name);
    setUserImage(image);
  };

  return (
    <FirebaseProvider firebase={app} firestore={db}>
      <Router>
        <div>
          <div id="nav">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/workspaces">Workspaces</Link>
              </li>
              <li>
                <Link to="/login">
                  {props.user == undefined && <p>Log In</p>}
                  {props.user != undefined && (
                    <p id="user">
                      <img src={props.pic} id="userPic" />
                      {props.name}
                    </p>
                  )}
                </Link>
              </li>
            </ul>
          </div>

          <hr />

          <Switch>
            <Route exact path="/workspaces">
              <Workspaces />
            </Route>
            <Route exact path="/workspaces/:workspaceId">
              <Workspace />
            </Route>
            <Route exact path="/">
              <Home user={userName} pic={userImage} />
            </Route>
            <Route exact path="/login">
              <LoginBar onclick={loginName} user={userName} pic={userImage} />
            </Route>
          </Switch>
        </div>
      </Router>
    </FirebaseProvider>
  );
};

export default App;
