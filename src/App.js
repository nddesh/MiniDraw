import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import { FirebaseProvider } from './contexts/firebaseContext';

import Home from './routes/Home';
import Workspaces from './routes/Workspaces';
import Workspace from './routes/Workspace';

import { firebaseConfig } from './config.js';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { getFirestore, getDoc, doc, collection, setDoc } from 'firebase/firestore';

const app = firebase.initializeApp(firebaseConfig);
const db = getFirestore(app);

const App = () => {
  return (
    <FirebaseProvider firebase={app} firestore={db}>
      <Router>
        <div>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/workspaces">Workspaces</Link>
            </li>
          </ul>

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
    </FirebaseProvider>
  );
};

export default App;
