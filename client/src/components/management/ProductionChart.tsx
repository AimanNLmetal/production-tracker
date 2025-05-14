import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PROCESSES, DATE_RANGES } from "@/lib/constants";
import { ProductionEntryWithDetails } from "@shared/schema";

// Helper functions for data processing
const getStartDateFromRange = (range: string): Date => {
  const now = new Date();
  switch (range) {
    case "today":
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    case "3days":
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(now.getDate() - 3);
      return threeDaysAgo;
    case "week":
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return weekAgo;
    case "month":
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return monthAgo;
    default:
      return new Date(0); // Beginning of time
  }
};

// Function to generate chart data from production entries
const generateChartData = (entries: ProductionEntryWithDetails[]) => {
  // Group entries by time
  const entriesByTime = entries.reduce((acc, entry) => {
    if (!acc[entry.time]) {
      acc[entry.time] = { time: entry.time, quantity: 0 };
    }
    
    // Sum quantities from all details in this entry
    const totalQuantity = entry.details.reduce((sum, detail) => sum + detail.quantity, 0);
    acc[entry.time].quantity += totalQuantity;
    
    return acc;
  }, {} as Record<string, { time: string, quantity: number }>);
  
  // Convert to array and sort by time
  const timeOrder = ["8am", "9.45am", "11.30am", "2.45pm", "5pm", "8pm"];
  return Object.values(entriesByTime).sort((a, b) => 
    timeOrder.indexOf(a.time) - timeOrder.indexOf(b.time)
  );
};

export default function ProductionChart() {
  const [selectedProcess, setSelectedProcess] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("today");
  
  const { data: entries, isLoading } = useQuery({
    queryKey: ["/api/production"],
  });
  
  const startDate = getStartDateFromRange(dateRange);
  
  const filteredEntries = (entries as ProductionEntryWithDetails[] || [])
    .filter(entry => {
      // Filter by date
      const entryDate = new Date(entry.createdAt);
      if (entryDate < startDate) return false;
      
      // Filter by process if not "all"
      if (selectedProcess !== "all" && entry.process !== selectedProcess) return false;
      
      return true;
    });
  
  const chartData = generateChartData(filteredEntries);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-neutral-800">
            Production Output Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-neutral-800">
          Production Output Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 mb-4">
          <div>
            <Label htmlFor="filterProcess" className="block text-sm font-medium mb-1">
              Process
            </Label>
            <Select
              value={selectedProcess}
              onValueChange={setSelectedProcess}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Processes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Processes</SelectItem>
                {PROCESSES.map((process) => (
                  <SelectItem key={process} value={process}>
                    {process}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="filterDateRange" className="block text-sm font-medium mb-1">
              Date Range
            </Label>
            <Select
              value={dateRange}
              onValueChange={setDateRange}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  name="Units Produced"
                  dataKey="quantity"
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500">
              No production data available for the selected filters.
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-neutral-500">
          Chart shows output quantities by time. Adjust filters to view different data sets.
        </div>
      </CardContent>
    </Card>
  );
}
