import { useProtectedRoute } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import ProductionChart from "@/components/management/ProductionChart";
import SendInstructions from "@/components/management/SendInstructions";
import ProductionDataTable from "@/components/management/ProductionDataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductionEntryWithDetails } from "@shared/schema";

export default function ManagementDashboard() {
  const { isAuthorized, isLoading } = useProtectedRoute("management");
  
  // Get production data for summary
  const { data: productionData, isLoading: isProductionLoading } = useQuery({
    queryKey: ["/api/production"],
    enabled: isAuthorized,
  });
  
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
  
  // Calculate summary statistics
  const entries = productionData as ProductionEntryWithDetails[] || [];
  
  // Total units produced
  const totalUnits = entries.reduce((total, entry) => {
    return total + entry.details.reduce((sum, detail) => sum + detail.quantity, 0);
  }, 0);
  
  // Count of unique operators
  const uniqueOperators = new Set(entries.map(entry => entry.operatorId)).size;
  
  // Count of entries in the last 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const recentEntries = entries.filter(entry => 
    new Date(entry.createdAt) > oneDayAgo
  ).length;
  
  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-800">Management Dashboard</h2>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits.toFixed(1)} units</div>
            <p className="text-xs text-muted-foreground">Across all processes and stations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Operators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueOperators}</div>
            <p className="text-xs text-muted-foreground">Unique operator IDs in system</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEntries}</div>
            <p className="text-xs text-muted-foreground">Production entries in last 24 hours</p>
          </CardContent>
        </Card>
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
