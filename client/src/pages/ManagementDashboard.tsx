import { useProtectedRoute } from "@/hooks/use-auth";
import ProductionChart from "@/components/management/ProductionChart";
import SendInstructions from "@/components/management/SendInstructions";
import ProductionDataTable from "@/components/management/ProductionDataTable";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManagementDashboard() {
  const { isAuthorized, isLoading } = useProtectedRoute("management");
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6 flex flex-wrap justify-between items-center">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }
  
  if (!isAuthorized) {
    return null; // useProtectedRoute will handle the redirect
  }
  
  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-800">Management Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProductionChart />
        </div>
        <div>
          <SendInstructions />
        </div>
      </div>
      
      <ProductionDataTable />
    </div>
  );
}
