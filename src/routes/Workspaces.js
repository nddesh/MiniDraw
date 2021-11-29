import React from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

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
    const id = uuidv4();
    await addWorkspace(id);
  };

  return (
    <>
      <h1>Workspaces</h1>
      <ul>
        {workspaces.map((w) => {
          return (
            <Link to={`/workspaces/${w.id}`} key={w.id}>
              <li>{w.id}</li>
            </Link>
          );
        })}
      </ul>
      <button onClick={handleAddWorkspace}>Add Workspace</button>
    </>
  );
};

export default Workspaces;
