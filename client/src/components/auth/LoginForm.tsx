import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LoginForm() {
  const [operatorId, setOperatorId] = useState("");
  const [name, setName] = useState("");
  const [isManagementLogin, setIsManagementLogin] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!operatorId || !name) {
      toast({
        title: "Validation Error",
        description: "Please enter both ID and Name",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Use simpler login flow with ID and name only
      const role = isManagementLogin ? "management" : "operator";
      await login(operatorId, name, role);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const toggleLoginType = () => {
    setIsManagementLogin(!isManagementLogin);
    // Clear fields when switching login type
    setOperatorId("");
    setName("");
  };

  return (
    <Card className="max-w-md mx-auto mt-10 p-6">
      <CardContent className="p-0">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">
          {isManagementLogin ? "Management Login" : "Operator Login"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="operatorId" className="block text-sm font-medium mb-1">
              {isManagementLogin ? "Management ID" : "Operator ID"}
            </Label>
            <Input
              id="operatorId"
              type="text"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              className="w-full p-2"
              placeholder={isManagementLogin ? "Enter management ID" : "Enter operator ID (e.g. 12275)"}
            />
          </div>
          
          <div>
            <Label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2"
              placeholder="Enter your full name"
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
