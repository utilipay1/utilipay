"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PropertyModal } from "./PropertyModal";
import { Edit, Archive, RotateCcw, MoreHorizontal, Trash2, ChevronLeft, ChevronRight, AlertCircle, PauseCircle, PlayCircle } from "lucide-react";
import { PropertySchema, CompanySchema } from "@/lib/schemas";
import { z } from "zod";
import { format, isPast, isBefore, addDays, startOfDay } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useSWR, { mutate } from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Property = z.infer<typeof PropertySchema>;
type Company = z.infer<typeof CompanySchema>;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PropertyListProps {
  properties: Property[];
  isLoading: boolean;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  page: number;
  setPage: (page: number) => void;
}

export function PropertyList({ properties, isLoading, pagination, page, setPage }: PropertyListProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  const { data: companiesResponse } = useSWR('/api/companies?limit=1000', fetcher);

  const companies = useMemo(() => {
    const companiesMap: Record<string, Company> = {};
    if (companiesResponse?.data) {
      companiesResponse.data.forEach((c: Company) => {
        if (c._id) {
          companiesMap[c._id] = c;
        }
      });
    }
    return companiesMap;
  }, [companiesResponse]);

  const totalPages = pagination?.totalPages || 1;

  async function handleToggleManaged(e: React.MouseEvent, property: Property) {
    e.stopPropagation();
    const isCurrentlyManaged = property.is_managed !== false;
    const nextState = !isCurrentlyManaged;
    
    const action = isCurrentlyManaged ? "stop managing" : "resume management";
    if (!confirm(`Are you sure you want to ${action} this property?`)) return;

    try {
      const response = await fetch(`/api/properties/${property._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_managed: nextState }),
      });

      if (response.ok) {
        mutate((key) => typeof key === 'string' && key.startsWith('/api/properties'));
      }
    } catch (error) {
      console.error(`Failed to toggle managed status:`, error);
    }
  }

  async function handleArchive(e: React.MouseEvent, property: Property) {
    e.stopPropagation(); // Prevent row click
    const action = property.is_archived ? "restore" : "archive";
    if (!confirm(`Are you sure you want to ${action} this property?`)) return;
    
    try {
      const response = await fetch(`/api/properties/${property._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_archived: !property.is_archived }),
      });

      if (response.ok) {
        mutate((key) => typeof key === 'string' && key.startsWith('/api/properties'));
      }
    } catch (error) {
      console.error(`Failed to ${action} property:`, error);
    }
  }

  async function handleDelete(e: React.MouseEvent, property: Property) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to PERMANENTLY delete this property and ALL associated bills? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/properties/${property._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
         mutate((key) => typeof key === 'string' && key.startsWith('/api/properties'));
      }
    } catch (error) {
      console.error("Failed to delete property:", error);
    }
  }

  const handleRowClick = (property: Property) => {
    setSelectedProperty(property);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation(); // Prevent row click
    setSelectedProperty(property);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  if (isLoading && properties.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[12px] p-0"></TableHead>
                <TableHead className="py-4 px-6">Property Address</TableHead>
                <TableHead className="py-4 px-6">Tenant Status</TableHead>
                <TableHead className="py-4 px-6">Managed Utilities</TableHead>
                <TableHead className="text-right py-4 px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="p-0"></TableCell>
                  <TableCell className="py-5 px-6"><Skeleton className="h-6 w-48" /></TableCell>
                  <TableCell className="py-5 px-6"><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6"><div className="flex justify-end"><Skeleton className="h-8 w-8 rounded-md" /></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[12px] p-0"></TableHead>
              <TableHead className="py-4 px-6">Property Address</TableHead>
              <TableHead className="py-4 px-6">Tenant Status</TableHead>
              <TableHead className="py-4 px-6">Managed Utilities</TableHead>
              <TableHead className="text-right py-4 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                  No properties found.
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => {
                const moveOutDate = property.tenant_info?.move_out_date ? new Date(property.tenant_info.move_out_date) : null;
                const isMoveOutPast = moveOutDate ? isPast(moveOutDate) : false;
                const isMoveOutSoon = moveOutDate ? isBefore(moveOutDate, addDays(startOfDay(new Date()), 14)) && !isMoveOutPast : false;
                const isManaged = property.is_managed !== false;
                const isNotManaged = !isManaged;

                return (
                  <TableRow 
                    key={property._id} 
                    className={cn(
                      "group hover:bg-muted/50 transition-colors cursor-pointer relative",
                      property.is_archived && "opacity-60 bg-muted/20",
                      isNotManaged && "opacity-70 grayscale-[0.5]"
                    )}
                    onClick={() => handleRowClick(property)}
                  >
                    <TableCell className="p-0">
                      {isNotManaged && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted-foreground/30" title="Not Managed" />
                      )}
                      {(isMoveOutPast || isMoveOutSoon) && property.tenant_status === 'Occupied' && (
                        <div className={cn(
                          "absolute left-0 top-0 bottom-0 w-1",
                          isMoveOutPast ? "bg-destructive" : "bg-urgency-medium"
                        )} />
                      )}
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-base">{property.address}</span>
                        {isNotManaged && (
                          <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60 mt-0.5">
                            Management Paused
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="flex flex-col gap-1.5">
                        <span className={`w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          property.tenant_status === 'Occupied' 
                            ? 'bg-green-50 text-green-700 border-green-100' 
                            : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                        }`}>
                          {property.tenant_status}
                        </span>
                        {property.tenant_status === 'Occupied' && moveOutDate && (
                          <div className={cn(
                            "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter",
                            isMoveOutPast ? "text-destructive" : isMoveOutSoon ? "text-urgency-medium" : "text-muted-foreground/60"
                          )}>
                            {(isMoveOutPast || isMoveOutSoon) && <AlertCircle className="h-3 w-3" />}
                            <span>Out: {format(moveOutDate, 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="flex flex-wrap gap-1">
                        {property.utilities_managed.map((u) => (
                          <span key={u} className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">
                            {u}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-5 px-6">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={(e) => handleEditClick(e, property)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => handleToggleManaged(e, property)}
                              className="cursor-pointer"
                            >
                              {isManaged ? (
                                <>
                                  <PauseCircle className="mr-2 h-4 w-4" />
                                  Stop Managing
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="mr-2 h-4 w-4" />
                                  Resume Management
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => handleArchive(e, property)}
                              className="cursor-pointer"
                            >
                              {property.is_archived ? (
                                <>
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Restore
                                </>
                              ) : (
                                <>
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archive
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => handleDelete(e, property)} 
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
       {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page <= 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <PropertyModal
        property={selectedProperty}
        companies={companies}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          mutate((key) => typeof key === 'string' && key.startsWith('/api/properties'));
          setIsModalOpen(false);
        }}
        defaultMode={modalMode}
      />
    </div>
  );
}
