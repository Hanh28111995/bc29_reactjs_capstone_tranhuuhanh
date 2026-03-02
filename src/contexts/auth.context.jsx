import LoginModal from 'pages/login/LoginModal';
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);

    const openLogin = () => setLoginModalOpen(true);
    const closeLogin = () => setLoginModalOpen(false);

    return (
        <AuthContext.Provider value={{ isLoginModalOpen, openLogin, closeLogin }}>
            {children}
            <LoginModal />
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);