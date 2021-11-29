import React from 'react';
import { getDoc, doc, collection, setDoc, getDocs } from 'firebase/firestore';

import { createCommandInstance } from '../shared/commandObjects/utils';

export const FirebaseContext = React.createContext({});

export const FirebaseProvider = ({ firebase, firestore, children }) => {
  const getWorkspaceData = async (workspaceId, undoHandler) => {
    const docRef = doc(firestore, 'workspaces', workspaceId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const doc = docSnap.data();
      const newCommandList = doc.workspaceData.commandList.map((c) => {
        return createCommandInstance(undoHandler, c);
      });
      return { ...doc.workspaceData, commandList: newCommandList };
    } else {
      console.log('No such document!');
    }
  };

  const updateWorkspaceData = async (
    workspaceId,
    { shapes, shapesMap, commandList, currCommand }
  ) => {
    const updatedDoc = {
      shapes,
      shapesMap,
      commandList,
      currCommand,
    };
    const workspacesRef = collection(firestore, 'workspaces');
    // TODO: Replace test-user with real user.
    await setDoc(doc(workspacesRef, workspaceId), {
      users: ['test-user'],
      workspaceData: updatedDoc,
    });
  };

  const getWorkspaces = async () => {
    // TODO: Get only current user's workspaces.
    const querySnapshot = await getDocs(collection(firestore, 'workspaces'));
    let workspaces = [];
    querySnapshot.forEach((doc) => {
      workspaces.push({ id: doc.id, ...doc.data() });
    });

    return workspaces;
  };

  const addWorkspace = async (id) => {
    const workspacesRef = collection(firestore, 'workspaces');

    await setDoc(doc(workspacesRef, id), {
      users: [], // TODO: Add current user.
      workspaceData: {
        shapes: [],
        shapesMap: {},
        commandList: [],
        currCommand: -1,
      },
    });
  };

  return (
    <FirebaseContext.Provider
      value={{
        firebase,
        firestore,
        getWorkspaceData,
        updateWorkspaceData,
        getWorkspaces,
        addWorkspace,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};