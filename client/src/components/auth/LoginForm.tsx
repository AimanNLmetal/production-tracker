import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isManagementLogin, setIsManagementLogin] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await login(username, password);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const toggleLoginType = () => {
    setIsManagementLogin(!isManagementLogin);
    // Pre-fill username for demo purposes
    if (!isManagementLogin) {
      setUsername("manager");
    } else {
      setUsername("operator");
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10 p-6">
      <CardContent className="p-0">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">
          {isManagementLogin ? "Management Login" : "Operator Login"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2"
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2"
              placeholder="Enter your password"
            />
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              variant={isManagementLogin ? "secondary" : "default"}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
        
        <div className="mt-4">
          <Button 
            variant="link" 
            onClick={toggleLoginType} 
            className="text-sm p-0"
          >
            {isManagementLogin ? "Login as Operator" : "Login as Management"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
