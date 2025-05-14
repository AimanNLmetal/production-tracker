import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PROCESSES, INSTRUCTION_TYPES, STATIONS_BY_PROCESS } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Form schema
const instructionFormSchema = z.object({
  type: z.string().min(1, "Instruction type is required"),
  targetProcess: z.string().min(1, "Target process is required"),
  targetStation: z.string().min(1, "Target station is required"),
  details: z.string().optional(),
});

type InstructionFormValues = z.infer<typeof instructionFormSchema>;

export default function SendInstructions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProcess, setSelectedProcess] = useState<string>("");
  
  // Initialize form
  const form = useForm<InstructionFormValues>({
    resolver: zodResolver(instructionFormSchema),
    defaultValues: {
      type: "",
      targetProcess: "",
      targetStation: "",
      details: "",
    }
  });
  
  // Determine available stations based on selected process
  let availableStations: string[] = ["All Stations"];

  if (selectedProcess === "All Processes") {
    // For "All Processes", we only offer "All Stations" option
    availableStations = ["All Stations"];
  } else if (selectedProcess === "Mul.Drilling") {
    availableStations = ["All Stations", ...STATIONS_BY_PROCESS["Mul.Drilling"]];
  } else if (selectedProcess) {
    availableStations = ["All Stations", ...STATIONS_BY_PROCESS.default];
  }
  
  // Mutation for sending instructions
  const instructionMutation = useMutation({
    mutationFn: async (data: InstructionFormValues) => {
      if (!user) throw new Error("User not logged in");
      
      return apiRequest("POST", "/api/instructions", {
        userId: user.id,
        ...data
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Instructions sent successfully to operators!",
      });
      
      // Reset form
      form.reset({
        type: "",
        targetProcess: "",
        targetStation: "",
        details: "",
      });
      setSelectedProcess("");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/instructions"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send instructions: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: InstructionFormValues) => {
    instructionMutation.mutate(data);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-neutral-800">
          Send Instructions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Instruction Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={instructionMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select instruction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INSTRUCTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Process */}
            <FormField
              control={form.control}
              name="targetProcess"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Process</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedProcess(value);
                      form.setValue("targetStation", ""); // Reset station when process changes
                    }}
                    disabled={instructionMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target process" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="All Processes">All Processes</SelectItem>
                      {PROCESSES.map((process) => (
                        <SelectItem key={process} value={process}>
                          {process}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Station */}
            <FormField
              control={form.control}
              name="targetStation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Station</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedProcess || instructionMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target station" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableStations.map((station) => (
                        <SelectItem key={station} value={station}>
                          {station}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message Details */}
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter additional details or instructions"
                      className="resize-none"
                      rows={4}
                      {...field}
                      disabled={instructionMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              variant="secondary"
              disabled={instructionMutation.isPending}
            >
              {instructionMutation.isPending ? "Sending..." : "Send Instructions"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
