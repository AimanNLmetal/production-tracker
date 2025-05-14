import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Production Output Tracker</h1>
        
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 text-white hover:bg-primary/80">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user.name.split(" ").map(part => part[0]).join("")}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user.role === "operator" && user.operatorId && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Operator ID: {user.operatorId}
                  </div>
                )}
                {user.role === "management" && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Management Access
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  asChild
                  className="cursor-pointer"
                >
                  <Link href={user.role === "operator" ? "/operator" : "/management"}>
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logout}
                  className="cursor-pointer"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </div>
    </header>
  );
}
