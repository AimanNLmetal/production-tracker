import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/constants";
import { Instruction } from "@shared/schema";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Bell, BellRing, AlertTriangle, InfoIcon, CheckCircle2, WrenchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ManagementMessages({ process, station }: { process: string, station: string }) {
  const { user } = useAuth();
  const [hasUnreadWarnings, setHasUnreadWarnings] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date>(new Date());
  
  // Filter instructions for this operator's station/process if logged in as operator
  const { data: allInstructions, isLoading } = useQuery({
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

  // Function to get the appropriate icon for each instruction type
  const getInstructionIcon = (type: string) => {
    switch (type) {
      case "Increase output":
        return <BellRing className="h-5 w-5 text-warning" />;
      case "Quality check":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "Slow down production":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "Maintenance required":
        return <WrenchIcon className="h-5 w-5 text-primary" />;
      default:
        return <InfoIcon className="h-5 w-5 text-neutral-500" />;
    }
  };
  
  // Check for new warnings on data update
  useEffect(() => {
    if (!allInstructions) return;
    
    const instructions = allInstructions as Instruction[];
    const hasNewWarnings = instructions.some(instruction => 
      new Date(instruction.createdAt) > lastCheckedTime && 
      (instruction.type === "Slow down production" || instruction.type === "Maintenance required")
    );
    
    if (hasNewWarnings) {
      setHasUnreadWarnings(true);
    }
  }, [allInstructions, lastCheckedTime]);
  
  // Mark warnings as read when viewing the component
  useEffect(() => {
    if (hasUnreadWarnings) {
      // Only reset after a few seconds so user can see the indication
      const timer = setTimeout(() => {
        setHasUnreadWarnings(false);
        setLastCheckedTime(new Date());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [hasUnreadWarnings]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-neutral-800 flex items-center">
            Management Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const allInstructionsData = allInstructions as Instruction[] || [];
  
  // Filter instructions relevant to this operator's process and station
  const managementInstructions = allInstructionsData.filter(instruction => {
    // Include if it's for all processes
    if (instruction.targetProcess === "All Processes") return true;
    
    // Include if it matches this operator's process
    if (instruction.targetProcess === process) {
      // And it's for all stations or matches this operator's station
      return instruction.targetStation === "All Stations" || instruction.targetStation === station;
    }
    
    return false;
  });
  
  return (
    <Card className={hasUnreadWarnings ? "border-destructive animate-pulse" : ""}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-neutral-800 flex items-center gap-2">
          Management Instructions
          {hasUnreadWarnings && (
            <Badge variant="destructive" className="animate-pulse">
              New Warnings
            </Badge>
          )}
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
                <div className="flex justify-between items-center">
                  <div className="font-medium flex items-center gap-2">
                    {getInstructionIcon(instruction.type)}
                    {instruction.type}
                  </div>
                  <div className="text-sm text-neutral-500">
                    {formatDate(new Date(instruction.createdAt))}
                  </div>
                </div>
                <div className="mt-2 text-neutral-800">
                  {instruction.details || `Please focus on ${instruction.targetProcess} at station ${instruction.targetStation}.`}
                </div>
                <div className="mt-2 text-xs text-neutral-500">
                  For: {instruction.targetProcess} - {instruction.targetStation}
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
