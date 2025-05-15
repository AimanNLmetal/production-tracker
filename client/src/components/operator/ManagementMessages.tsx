import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/constants";
import { Instruction } from "@shared/schema";
import { 
  BellRing, AlertTriangle, InfoIcon, 
  CheckCircle2, WrenchIcon, AlertCircle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ManagementMessages({ process, station }: { process: string, station: string }) {
  const { user } = useAuth();
  const [hasUnreadWarnings, setHasUnreadWarnings] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date>(new Date());
  const [warningCount, setWarningCount] = useState(0);
  
  // Filter instructions for this operator's station/process
  const { data: instructions, isLoading } = useQuery({
    queryKey: ["/api/instructions"],
    enabled: !!user,
    refetchInterval: 15000, // Refetch every 15 seconds to check for new instructions
  });
  
  // Function to determine if a message is a warning type
  const isWarningType = (type: string): boolean => {
    return type === "Slow down production" || type === "Maintenance required";
  };
  
  // Function to determine styling based on instruction type
  const getInstructionStyling = (type: string, isNew: boolean = false) => {
    const baseStyle = isNew ? "shadow-md" : "";
    
    switch (type) {
      case "Increase output":
        return cn(baseStyle, "border-warning bg-warning/10");
      case "Quality check":
        return cn(baseStyle, "border-success bg-success/10");
      case "Slow down production":
        return cn(baseStyle, "border-destructive bg-destructive/10", isNew && "animate-pulse");
      case "Maintenance required":
        return cn(baseStyle, "border-primary bg-primary/10", isNew && "animate-pulse");
      default:
        return cn(baseStyle, "border-neutral-300 bg-neutral-100");
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
        return <AlertCircle className="h-5 w-5 text-primary" />;
      default:
        return <InfoIcon className="h-5 w-5 text-neutral-500" />;
    }
  };
  
  // Process the instructions data and check for new messages
  useEffect(() => {
    if (!instructions || !process || !station) return;
    
    const instructionData = instructions as Instruction[];
    
    // Filter relevant instructions for this process and station
    const relevantInstructions = instructionData.filter(instruction => {
      if (instruction.targetProcess === "All Processes") return true;
      if (instruction.targetProcess === process) {
        return instruction.targetStation === "All Stations" || instruction.targetStation === station;
      }
      return false;
    });
    
    // Check for new warnings
    const newWarnings = relevantInstructions.filter(instruction => 
      new Date(instruction.createdAt) > lastCheckedTime && 
      isWarningType(instruction.type)
    );
    
    // Check for new messages
    const newMessages = relevantInstructions.filter(instruction => 
      new Date(instruction.createdAt) > lastCheckedTime
    );
    
    if (newWarnings.length > 0) {
      setHasUnreadWarnings(true);
      setWarningCount(newWarnings.length);
    }
    
    if (newMessages.length > 0) {
      setHasUnreadMessages(true);
    }
  }, [instructions, lastCheckedTime, process, station]);
  
  // Reset notification indicators after some time
  useEffect(() => {
    if (hasUnreadWarnings || hasUnreadMessages) {
      const timer = setTimeout(() => {
        setHasUnreadWarnings(false);
        setHasUnreadMessages(false);
        setLastCheckedTime(new Date());
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [hasUnreadWarnings, hasUnreadMessages]);
  
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
  
  const instructionData = instructions as Instruction[] || [];
  const noCurrentProcessOrStation = !process || !station;
  
  // Filter relevant instructions for this process and station
  const filteredInstructions = instructionData.filter(instruction => {
    if (instruction.targetProcess === "All Processes") return true;
    if (instruction.targetProcess === process) {
      return instruction.targetStation === "All Stations" || instruction.targetStation === station;
    }
    return false;
  });
  
  // Check if there are any warning type instructions
  const hasWarningInstructions = filteredInstructions.some(instruction => 
    isWarningType(instruction.type)
  );
  
  // Sort instructions to show warnings first, then most recent
  const sortedInstructions = [...filteredInstructions].sort((a, b) => {
    // Put warnings at the top
    if (isWarningType(a.type) && !isWarningType(b.type)) return -1;
    if (!isWarningType(a.type) && isWarningType(b.type)) return 1;
    
    // Then sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Check if an instruction is new
  const isNewInstruction = (createdAt: string | Date): boolean => {
    return new Date(createdAt) > lastCheckedTime;
  };

  return (
    <Card className={cn(
      hasUnreadWarnings ? "border-destructive animate-pulse shadow-md" : "",
      hasWarningInstructions && !hasUnreadWarnings ? "border-warning" : ""
    )}>
      <CardHeader className={hasUnreadWarnings ? "bg-destructive/5" : ""}>
        <CardTitle className="text-xl font-semibold text-neutral-800 flex items-center gap-2">
          Management Instructions
          {hasUnreadWarnings && (
            <Badge variant="destructive" className="animate-pulse">
              {warningCount > 1 ? `${warningCount} New Warnings` : "New Warning"}
            </Badge>
          )}
          {hasUnreadMessages && !hasUnreadWarnings && (
            <Badge variant="secondary" className="animate-pulse">
              New Messages
            </Badge>
          )}
        </CardTitle>
        {noCurrentProcessOrStation && (
          <CardDescription className="text-amber-500">
            Submit a production entry to see instructions for your process and station.
          </CardDescription>
        )}
        {process && station && (
          <CardDescription>
            Showing instructions for {process} - Station {station}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedInstructions.length > 0 ? (
            sortedInstructions.map((instruction) => {
              const isNew = isNewInstruction(instruction.createdAt);
              const isWarning = isWarningType(instruction.type);
              
              return (
                <div 
                  key={instruction.id} 
                  className={cn(
                    `p-4 border-l-4 rounded-md transition-all duration-300`,
                    getInstructionStyling(instruction.type, isNew),
                    isNew && "scale-[1.02]"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium flex items-center gap-2">
                      {getInstructionIcon(instruction.type)}
                      <span className={isWarning ? "font-bold" : ""}>
                        {instruction.type}
                      </span>
                      {isNew && (
                        <Badge variant={isWarning ? "destructive" : "outline"} className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {formatDate(new Date(instruction.createdAt))}
                    </div>
                  </div>
                  <div className={cn(
                    "mt-2",
                    isWarning ? "text-neutral-900 font-medium" : "text-neutral-800"
                  )}>
                    {instruction.details || `Please focus on ${instruction.targetProcess} at station ${instruction.targetStation}.`}
                  </div>
                  <div className="mt-2 text-xs text-neutral-500">
                    For: {instruction.targetProcess} - {instruction.targetStation}
                  </div>
                </div>
              );
            })
          ) : noCurrentProcessOrStation ? (
            <div className="p-4 border border-dashed border-neutral-200 rounded-md text-center text-neutral-500">
              Submit a production entry to see instructions for your process and station.
            </div>
          ) : (
            <div className="p-4 border border-dashed border-neutral-200 rounded-md text-center text-neutral-500">
              No management instructions for {process} - Station {station} at this time.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}