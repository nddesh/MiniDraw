import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import { FirebaseProvider } from './contexts/firebaseContext';
import { AuthProvider } from './contexts/authContext';

import './App.css';
import Home from './routes/Home';
import Workspaces from './routes/Workspaces';
import Workspace from './routes/Workspace';

// import { LoginBar } from './routes/LoginBar/LoginBar';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { getFirestore, getDoc, doc, collection, setDoc } from 'firebase/firestore';
// import { firebaseConfig } from './config';

const firebaseConfig = {
  apiKey: "AIzaSyCIsdWX7PJDu_11OZ5JYC0AKOR2HKnM4os",
  authDomain: "ssui-final-e3ad1.firebaseapp.com",
  projectId: "ssui-final-e3ad1",
  storageBucket: "ssui-final-e3ad1.appspot.com",
  messagingSenderId: "356861063639",
  appId: "1:356861063639:web:8544972b6eba38fbfe5b92"
};

const app = firebase.initializeApp(firebaseConfig);
const db = getFirestore(app);

const App = (props) => {
  return (
    <FirebaseProvider firebase={app} firestore={db}>
      <AuthProvider>
        <Router>
          <div>
            <div id="nav">
              <h1>Mini Draw</h1>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/workspaces">Workspaces</Link>
                </li>
                {/* <li>
                  <Link to="/login">
                    {props.user == undefined && <p>Log In</p>}
                    {props.user != undefined && (
                      <p id="user">
                        <img src={props.pic} id="userPic" />
                        {props.name}
                      </p>
                    )}
                  </Link>
                </li> */}
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
                <Home />
              </Route>
            </Switch>
          </div>
        </Router>
      </AuthProvider>
    </FirebaseProvider>
  );
};

export default App;
