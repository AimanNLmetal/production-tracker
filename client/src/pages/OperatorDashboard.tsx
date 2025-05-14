import { useState } from "react";
import { useProtectedRoute } from "@/hooks/use-auth";
import ProductionEntryForm from "@/components/operator/ProductionEntryForm";
import EntrySummary from "@/components/operator/EntrySummary";
import ManagementMessages from "@/components/operator/ManagementMessages";
import { Skeleton } from "@/components/ui/skeleton";

export default function OperatorDashboard() {
  const { isAuthorized, isLoading } = useProtectedRoute("operator");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleFormSubmit = () => {
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProductionEntryForm onSubmitSuccess={handleFormSubmit} />
        <EntrySummary refreshTrigger={refreshTrigger} />
      </div>
      
      <ManagementMessages />
    </div>
  );
}
