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
    <header className="bg-gradient-to-r from-primary to-accent text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center overflow-hidden">
            <img src="/assets/nl_metals_logo.jfif" alt="NL Metals Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-semibold">NL Metals Production Tracker</h1>
        </div>
        
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 text-white hover:bg-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/40">
                    <span className="text-sm font-medium">
                      {user.name.split(" ").map(part => part[0]).join("")}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Always show ID for all users */}
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {user.role === "operator" ? "Operator" : "Management"} ID: {user.operatorId}
                </div>
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
