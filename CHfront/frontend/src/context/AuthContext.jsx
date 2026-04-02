import { createContext, useState, useEffect } from "react";

/* ----------------------- */
/* CREATE AUTH CONTEXT     */
/* ----------------------- */
export const AuthContext = createContext();

/* ----------------------- */
/* AUTH PROVIDER           */
/* ----------------------- */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ----------------------- */
  /* LOAD USER FROM STORAGE  */
  /* ----------------------- */
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("chatAppUser");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Failed to load user:", err);
    } finally {
      setLoading(false); // important
    }
  }, []);

  /* ----------------------- */
  /* LOGIN FUNCTION          */
  /* ----------------------- */
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("chatAppUser", JSON.stringify(userData));
  };

  /* ----------------------- */
  /* LOGOUT FUNCTION         */
  /* ----------------------- */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("chatAppUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};