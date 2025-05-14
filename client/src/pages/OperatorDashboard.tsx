import { useState, useEffect } from "react";
import { useProtectedRoute, useAuth } from "@/hooks/use-auth";
import ProductionEntryForm from "@/components/operator/ProductionEntryForm";
import EntrySummary from "@/components/operator/EntrySummary";
import ManagementMessages from "@/components/operator/ManagementMessages";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ProductionEntryWithDetails } from "@shared/schema";

export default function OperatorDashboard() {
  const { isAuthorized, isLoading } = useProtectedRoute("operator");
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentProcess, setCurrentProcess] = useState<string>(""); 
  const [currentStation, setCurrentStation] = useState<string>("");
  
  // Get recent production entries to determine operator's current process/station
  const { data: entries } = useQuery({
    queryKey: ["/api/production", { userId: user?.id }, refreshTrigger],
    enabled: !!user
  });
  
  // Update current process and station when entries change
  useEffect(() => {
    if (entries) {
      const productionEntries = entries as ProductionEntryWithDetails[] || [];
      if (productionEntries.length > 0) {
        // Sort by most recent first
        const sortedEntries = [...productionEntries].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const latestEntry = sortedEntries[0];
        
        // Update current process and station based on last submission
        setCurrentProcess(latestEntry.process);
        setCurrentStation(latestEntry.station);
      }
    }
  }, [entries]);
  
  const handleFormSubmit = (process: string, station: string) => {
    // Update current process and station
    setCurrentProcess(process);
    setCurrentStation(station);
    
    // Increment refresh trigger to force EntrySummary to refresh
    setRefreshTrigger(prev => prev + 1);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6 flex flex-wrap justify-between items-center">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }
  
  if (!isAuthorized) {
    return null; // useProtectedRoute will handle the redirect
  }
  
  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-800">Operator Dashboard</h2>
        {currentProcess && currentStation && (
          <div className="text-md text-muted-foreground">
            Current: <span className="font-medium">{currentProcess}</span> - Station <span className="font-medium">{currentStation}</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProductionEntryForm onSubmitSuccess={handleFormSubmit} />
        <EntrySummary refreshTrigger={refreshTrigger} />
      </div>
      
      <ManagementMessages 
        process={currentProcess} 
        station={currentStation} 
      />
    </div>
  );
}
