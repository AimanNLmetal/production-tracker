import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define user type
type User = {
  id: number;
  username: string;
  name: string;
  role: "operator" | "management";
  operatorId?: string;
};

// Define auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Check for existing user in local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("productionTrackerUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("productionTrackerUser");
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await response.json();
      
      // Save user data
      setUser(userData);
      localStorage.setItem("productionTrackerUser", JSON.stringify(userData));
      
      // Redirect based on role
      if (userData.role === "operator") {
        navigate("/operator");
      } else if (userData.role === "management") {
        navigate("/management");
      }
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("productionTrackerUser");
    navigate("/");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook to protect routes that require authentication
export function useProtectedRoute(requiredRole?: "operator" | "management") {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/");
      return;
    }

    if (!isLoading && requiredRole && user?.role !== requiredRole) {
      if (user?.role === "operator") {
        navigate("/operator");
      } else if (user?.role === "management") {
        navigate("/management");
      } else {
        navigate("/");
      }
    }
  }, [user, isLoading, navigate, requiredRole]);

  return { isAuthorized: !!user && (!requiredRole || user.role === requiredRole), isLoading };
}
