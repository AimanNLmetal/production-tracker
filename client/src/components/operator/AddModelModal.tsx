import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MODELS } from "@/lib/constants";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";

// Form schema
const additionalModelSchema = z.object({
  model: z.string().min(1, "Model is required"),
  quantity: z.coerce
    .number()
    .positive("Quantity must be positive")
    .min(0.1, "Quantity must be at least 0.1")
});

type AdditionalModelFormValues = z.infer<typeof additionalModelSchema>;

interface AddModelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AdditionalModelFormValues) => void;
  isSubmitting: boolean;
}

export default function AddModelModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddModelModalProps) {
  const form = useForm<AdditionalModelFormValues>({
    resolver: zodResolver(additionalModelSchema),
    defaultValues: {
      model: "",
      quantity: undefined
    }
  });
  
  const handleSubmit = (values: AdditionalModelFormValues) => {
    onSubmit(values);
    form.reset();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Additional Model</DialogTitle>
          <DialogDescription>
            Add another model to the current production entry.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
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
              name="quantity"
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
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Model"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
