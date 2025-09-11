import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { API_URL } from "../config/const ";

interface User {
  id: string;
  name: string;
  role: "admin" | "viewer" | "user";
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
  role: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// JWT token parsing function with proper error handling
const parseJwtToken = (token: string): any => {
  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    // Split token into parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if needed
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const jsonPayload = decodeURIComponent(
      window
        .atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);

    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.log("Token expired");
      return null;
    }

    return payload;
  } catch (error) {
    console.error("JWT parsing error:", error);
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [role, setRole] = useState<string | null>(null);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem("token");

        if (storedToken) {
          const decoded = parseJwtToken(storedToken);

          if (decoded) {
            // Extract user data from token
            const userData = {
              id: decoded.sub || decoded.user_id || decoded.id || "",
              name: decoded.name || decoded.username || "User",
              role: decoded.role || "user",
              email: decoded.email || "",
            };

            setUser(userData);
            setToken(storedToken);
            setRole(decoded.role || "user");
            setIsAuthenticated(true);

            // Set axios authorization header
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${storedToken}`;
          } else {
            // Token is invalid or expired
            localStorage.removeItem("token");
            setUser(null);
            setToken(null);
            setRole(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
        setRole(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Login failed:", errorData);
        return false;
      }

      const data = await response.json();

      if (data.data && data.data.token) {
        const receivedToken = data.data.token;
        const decoded = parseJwtToken(receivedToken);

        if (decoded) {
          const userData = {
            id: decoded.sub || decoded.user_id || decoded.id || "",
            name: decoded.name || decoded.username || "User",
            role: decoded.role || "user",
            email: decoded.email || email,
          };

          setUser(userData);
          setToken(receivedToken);
          setRole(decoded.role || "user");
          setIsAuthenticated(true);

          localStorage.setItem("token", receivedToken);
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${receivedToken}`;

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
    setIsLoading(false);

    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    token,
    role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
