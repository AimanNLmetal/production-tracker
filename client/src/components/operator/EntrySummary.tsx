import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductionEntryWithDetails } from "@shared/schema";

export default function EntrySummary({ refreshTrigger }: { refreshTrigger: number }) {
  const { user } = useAuth();
  
  const { data: entries, isLoading } = useQuery({
    queryKey: ["/api/production", { userId: user?.id }, refreshTrigger],
    enabled: !!user,
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-neutral-800">
            Current Entry Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const productionEntries = entries as ProductionEntryWithDetails[] || [];
  // Sort by most recent first
  const sortedEntries = [...productionEntries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const latestEntry = sortedEntries[0];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-neutral-800">
          Current Entry Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {latestEntry ? (
          <div className="space-y-4">
            <div className="p-4 border border-neutral-200 rounded-md bg-neutral-100">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-sm text-neutral-500">Process:</span>
                  <span className="ml-1 font-medium text-neutral-800">{latestEntry.process}</span>
                </div>
                <div>
                  <span className="text-sm text-neutral-500">Station:</span>
                  <span className="ml-1 font-medium text-neutral-800">{latestEntry.station}</span>
                </div>
                <div>
                  <span className="text-sm text-neutral-500">Time:</span>
                  <span className="ml-1 font-medium text-neutral-800">{latestEntry.time}</span>
                </div>
              </div>
              
              <div className="mt-3">
                <h4 className="text-sm font-medium text-neutral-800 mb-2">Models and Quantities:</h4>
                <div className="bg-white p-2 rounded-md border border-neutral-200">
                  {latestEntry.details.map((detail, index) => (
                    <div 
                      key={detail.id} 
                      className={`flex justify-between items-center ${
                        index < latestEntry.details.length - 1 ? 'border-b pb-1 mb-1' : ''
                      }`}
                    >
                      <span className="font-medium">{detail.model}</span>
                      <span>{detail.quantity} units</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Previous entries */}
            {sortedEntries.slice(1).map((entry) => (
              <div 
                key={entry.id} 
                className="p-4 border border-neutral-200 rounded-md"
              >
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <span className="text-sm text-neutral-500">Process:</span>
                    <span className="ml-1 font-medium text-neutral-800">{entry.process}</span>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">Station:</span>
                    <span className="ml-1 font-medium text-neutral-800">{entry.station}</span>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">Time:</span>
                    <span className="ml-1 font-medium text-neutral-800">{entry.time}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-neutral-800 mb-1">Models:</div>
                  <div className="flex flex-wrap gap-2">
                    {entry.details.map((detail) => (
                      <div 
                        key={detail.id} 
                        className="bg-neutral-100 px-2 py-1 rounded-md text-sm"
                      >
                        {detail.model}: {detail.quantity}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 border border-dashed border-neutral-200 rounded-md bg-white text-center text-neutral-500">
            No production entries yet. Submit your first entry using the form.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
