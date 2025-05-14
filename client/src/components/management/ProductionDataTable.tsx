import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/constants";
import { ProductionEntryWithDetails } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

// Pagination component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        // If we have more than 5 pages, show a small window around the current page
        let pageNumber = i + 1;
        if (totalPages > 5) {
          if (currentPage <= 3) {
            pageNumber = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNumber = totalPages - 4 + i;
          } else {
            pageNumber = currentPage - 2 + i;
          }
        }
        
        return (
          <Button
            key={pageNumber}
            variant={currentPage === pageNumber ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        Next
      </Button>
    </div>
  );
}

export default function ProductionDataTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterProcess, setFilterProcess] = useState<string>("all");
  const [filterModel, setFilterModel] = useState<string>("all");
  const [filterOperatorId, setFilterOperatorId] = useState<string>("");
  const PAGE_SIZE = 10;
  
  const { data: entries, isLoading } = useQuery({
    queryKey: ["/api/production"],
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-neutral-800">
            Production Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const productionEntries = entries as ProductionEntryWithDetails[] || [];
  
  // Create flattened entries for table display
  const flattenedEntries = productionEntries.flatMap((entry) => 
    entry.details.map((detail) => ({
      id: `${entry.id}-${detail.id}`,
      date: new Date(entry.createdAt),
      operatorId: entry.operatorId,
      process: entry.process,
      station: entry.station,
      time: entry.time,
      model: detail.model,
      quantity: detail.quantity,
    }))
  );
  
  // Apply filters
  const filteredEntries = flattenedEntries.filter(entry => {
    // Filter by process if not "all"
    if (filterProcess !== "all" && entry.process !== filterProcess) return false;
    
    // Filter by model if not "all"
    if (filterModel !== "all" && entry.model !== filterModel) return false;
    
    // Filter by operator ID if provided
    if (filterOperatorId && !entry.operatorId.includes(filterOperatorId)) return false;
    
    return true;
  });
  
  // Sort by most recent first
  const sortedEntries = [...filteredEntries].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
  
  // Apply pagination
  const totalItems = sortedEntries.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedEntries = sortedEntries.slice(startIndex, startIndex + PAGE_SIZE);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-neutral-800">
          Production Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Operator ID</TableHead>
                <TableHead>Process</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntries.length > 0 ? (
                paginatedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell>{entry.operatorId}</TableCell>
                    <TableCell>{entry.process}</TableCell>
                    <TableCell>{entry.station}</TableCell>
                    <TableCell>{entry.time}</TableCell>
                    <TableCell>{entry.model}</TableCell>
                    <TableCell className="font-medium">{entry.quantity}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-neutral-500">
                    No production data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-neutral-500">
            {totalItems > 0 
              ? `Showing ${startIndex + 1} to ${Math.min(startIndex + PAGE_SIZE, totalItems)} of ${totalItems} entries`
              : 'No entries found'
            }
          </div>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
