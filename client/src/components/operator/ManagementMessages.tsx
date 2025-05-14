import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/constants";
import { Instruction } from "@shared/schema";

export default function ManagementMessages() {
  const { user } = useAuth();
  
  // Filter instructions for this operator's station/process if logged in as operator
  const { data: instructions, isLoading } = useQuery({
    queryKey: ["/api/instructions"],
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds to check for new instructions
  });
  
  // Function to determine styling based on instruction type
  const getInstructionStyling = (type: string) => {
    switch (type) {
      case "Increase output":
        return "border-warning bg-warning/10";
      case "Quality check":
        return "border-success bg-success/10";
      case "Slow down production":
        return "border-destructive bg-destructive/10";
      case "Maintenance required":
        return "border-primary bg-primary/10";
      default:
        return "border-neutral-300 bg-neutral-100";
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-neutral-800">
            Management Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const managementInstructions = instructions as Instruction[] || [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-neutral-800">
          Management Instructions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {managementInstructions.length > 0 ? (
            managementInstructions.map((instruction) => (
              <div 
                key={instruction.id} 
                className={`p-4 border-l-4 rounded-md ${getInstructionStyling(instruction.type)}`}
              >
                <div className="flex justify-between">
                  <div className="font-medium">{instruction.type}</div>
                  <div className="text-sm text-neutral-500">
                    {formatDate(new Date(instruction.createdAt))}
                  </div>
                </div>
                <div className="mt-1 text-neutral-800">
                  {instruction.details || `Please focus on ${instruction.targetProcess} at station ${instruction.targetStation}.`}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 border border-dashed border-neutral-200 rounded-md text-center text-neutral-500">
              No management instructions at this time.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
