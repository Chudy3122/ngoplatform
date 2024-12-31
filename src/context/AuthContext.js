// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/clerk-react";

const AuthContext = createContext({ user: null });

export const AuthProvider = ({ children }) => {
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("Clerk user:", clerkUser);
    if (clerkUser) {
      setUser({
        _id: clerkUser.id,
        // inne potrzebne pola
      });
    } else {
      setUser(null);
    }
  }, [clerkUser]);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
