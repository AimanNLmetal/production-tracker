import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import LoginPage from "@/pages/LoginPage";
import OperatorDashboard from "@/pages/OperatorDashboard";
import ManagementDashboard from "@/pages/ManagementDashboard";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 to-background swan-bg">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 relative z-10">
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm -z-10 rounded-lg"></div>
        <Switch>
          <Route path="/" component={LoginPage} />
          <Route path="/operator" component={OperatorDashboard} />
          <Route path="/management" component={ManagementDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
