import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { PROCESSES, STATIONS_BY_PROCESS, MODELS, TIMES } from "@/lib/constants";

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
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";

// Form schema
const productionFormSchema = z.object({
  process: z.string().min(1, "Process is required"),
  station: z.string().min(1, "Station is required"),
  time: z.string().min(1, "Time is required"),
  modelDetails: z.array(
    z.object({
      model: z.string().min(1, "Model is required"),
      quantity: z.coerce
        .number()
        .positive("Quantity must be positive")
        .min(0.1, "Quantity must be at least 0.1")
    })
  ).min(1, "At least one model is required")
});

type ProductionFormValues = z.infer<typeof productionFormSchema>;

export default function ProductionEntryForm({ 
  onSubmitSuccess 
}: { 
  onSubmitSuccess: (process: string, station: string) => void 
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProcess, setSelectedProcess] = useState<string>("");
  
  // Initialize form
  const form = useForm<ProductionFormValues>({
    resolver: zodResolver(productionFormSchema),
    defaultValues: {
      process: "",
      station: "",
      time: "",
      modelDetails: [{ model: "", quantity: undefined }]
    }
  });
  
  // Set up field array for model details
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "modelDetails"
  });
  
  // Determine available stations based on selected process
  const availableStations = selectedProcess === "Mul.Drilling" 
    ? STATIONS_BY_PROCESS["Mul.Drilling"] 
    : STATIONS_BY_PROCESS.default;
  
  // Mutation for submitting production entry
  const submitMutation = useMutation({
    mutationFn: async (data: ProductionFormValues) => {
      if (!user) throw new Error("User not logged in");
      
      // Create production entry
      const entryResponse = await apiRequest("POST", "/api/production", {
        userId: user.id,
        operatorId: user.operatorId, 
        process: data.process,
        station: data.station,
        time: data.time
      });
      
      const entry = await entryResponse.json();
      
      // Add production details for each model
      for (const detail of data.modelDetails) {
        await apiRequest("POST", `/api/production/${entry.id}/details`, {
          model: detail.model,
          quantity: detail.quantity
        });
      }
      
      return entry;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Production data submitted successfully!",
      });
      
      // Reset form and notify parent
      form.reset({
        process: "",
        station: "",
        time: "",
        modelDetails: [{ model: "", quantity: undefined }]
      });
      setSelectedProcess("");
      
      // Invalidate relevant queries and call success callback
      queryClient.invalidateQueries({ queryKey: ["/api/production"] });
      onSubmitSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit production data: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: ProductionFormValues) => {
    submitMutation.mutate(data);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-neutral-800">
          Record Production Output
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Process Selection */}
              <FormField
                control={form.control}
                name="process"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedProcess(value);
                        form.setValue("station", ""); // Reset station when process changes
                      }}
                      disabled={submitMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Process" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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

              {/* Station Selection */}
              <FormField
                control={form.control}
                name="station"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Station</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedProcess || submitMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Station" />
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

              {/* Time Selection */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={submitMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIMES.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Model Details */}
            <div className="space-y-3">
              <div className="text-sm font-medium">Model Details</div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border rounded-md">
                  <FormField
                    control={form.control}
                    name={`modelDetails.${index}.model`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={submitMutation.isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MODELS.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`modelDetails.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Enter quantity"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value === "" ? undefined : e.target.value);
                            }}
                            disabled={submitMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-1 text-destructive"
                      onClick={() => remove(index)}
                      disabled={submitMutation.isPending}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => append({ model: "", quantity: undefined })}
                disabled={submitMutation.isPending}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Another Model</span>
              </Button>
            </div>

            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
