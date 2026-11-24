
import { createContext, useContext, useState, useEffect } from "react";
import { loginUser as loginAPI, getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("careerpilot_token"));
  const [loading, setLoading] = useState(true);

  // Restore the login session when the application starts
  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser(token);
        setUser(response.user);
      } catch (error) {
        localStorage.removeItem("careerpilot_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login function
  const login = async (email, password) => {
    const response = await loginAPI({ email, password });

    localStorage.setItem("careerpilot_token", response.token);

    setToken(response.token);
    setUser(response.user);

    return response;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("careerpilot_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user && token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access authentication
export const useAuth = () => {
  return useContext(AuthContext);
};

