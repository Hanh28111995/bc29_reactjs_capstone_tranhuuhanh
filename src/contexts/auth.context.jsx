import React, { createContext, useState, useCallback, useMemo, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLogin = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLogin = useCallback(() => setIsLoginModalOpen(false), []);

  const value = useMemo(
    () => ({
      isLoginModalOpen,
      openLogin,
      closeLogin,
    }),
    [isLoginModalOpen, openLogin, closeLogin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
