import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to appropriate dashboard if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "operator") {
        navigate("/operator");
      } else if (user.role === "management") {
        navigate("/management");
      }
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-center mb-8 text-neutral-800">
        Production Output Tracker
      </h1>
      <LoginForm />
    </div>
  );
}
