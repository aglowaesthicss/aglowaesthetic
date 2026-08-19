import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "./api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "master_admin" | "staff" | "client";
  mobile_no?: string;
  age?: number;
  location?: string;
  client_id?: string;
  allowed_features?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  hasAccess: (feature: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem("aglow_token");
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      setToken(savedToken);
      const userData = await api.get<User>("/api/auth/me");
      setUser(userData);
    } catch (err) {
      console.error("Failed to authenticate with saved token", err);
      // Clean up invalid token
      localStorage.removeItem("aglow_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("aglow_token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("aglow_token");
    setToken(null);
    setUser(null);
    // Force redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const hasAccess = (feature: string): boolean => {
    if (!user) return false;
    // Master admin has access to everything override
    if (user.role === "master_admin") return true;
    
    // Check if the feature is in the user's allowed_features list
    if (user.allowed_features) {
      return user.allowed_features.includes(feature);
    }
    
    return true; // Default to true if not explicitly restricted
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    hasAccess,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
