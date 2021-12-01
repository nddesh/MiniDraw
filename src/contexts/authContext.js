import React from 'react';

export const AuthContext = React.createContext({});

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = React.useState(null);

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        setUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
