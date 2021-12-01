import React from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './Workspaces.css';

import { FirebaseContext } from '../contexts/firebaseContext';

const Workspaces = () => {
  const [workspaces, setWorkspaces] = React.useState([]);
  const { getWorkspaces, addWorkspace } = React.useContext(FirebaseContext);

  React.useEffect(() => {
    getData();
  });

  const getData = async () => {
    const workspaces = await getWorkspaces();
    setWorkspaces(workspaces);
  };

  const handleAddWorkspace = async () => {
    const workspaceName = prompt('Create the name of your workspace');
    const id = uuidv4();
    await addWorkspace(id, workspaceName);
  };

  return (
    <>
      <h1>Workspaces</h1>
      <ul id="workspaces">
        {workspaces.map((w) => {
          return (
            <Link to={`/workspaces/${w.id}`} key={w.id}>
              <li>{w.name ? w.name : `No name set for workspace ID ${w.id}`}</li>
            </Link>
          );
        })}
      </ul>
      <button onClick={handleAddWorkspace}>Add Workspace</button>
    </>
  );
};

export default Workspaces;
