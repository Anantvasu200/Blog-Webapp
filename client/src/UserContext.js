import React, { createContext, useState } from 'react';

// Create the UserContext
export const UserContext = createContext({});

// Create the UserContextProvider component
export function UserContextProvider({ children }) {
    const [userInfo, setUserInfo] = useState({});

    return (
        <UserContext.Provider value={{ userInfo, setUserInfo }}>
            {children}
        </UserContext.Provider>
    );
}
