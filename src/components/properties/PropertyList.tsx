"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Edit, Archive, RotateCcw, MoreHorizontal, Trash2 } from "lucide-react";
import { PropertySchema, CompanySchema } from "@/lib/schemas";
import { z } from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Property = z.infer<typeof PropertySchema>;
type Company = z.infer<typeof CompanySchema>;

export function PropertyList({ search = "", showArchived = false }: { search?: string; showArchived?: boolean }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [companies, setCompanies] = useState<Record<string, Company>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const [propsRes, companiesRes] = await Promise.all([
        fetch(`/api/properties?archived=${showArchived}`),
        fetch('/api/companies')
      ]);

      if (propsRes.ok && companiesRes.ok) {
        const propsData = await propsRes.json();
        const companiesData = await companiesRes.json();
        setProperties(propsData);

        const companiesMap: Record<string, Company> = {};
        companiesData.forEach((c: Company) => {
          if (c._id) {
            companiesMap[c._id] = c;
          }
        });
        setCompanies(companiesMap);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

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
        // If we are showing "Active Only", and we archive one, it should disappear.
        // If we are showing "Archived Only" (assuming showArchived means ONLY archived, or ALL? API says: true=archived, false=active).
        // So in both cases, the item toggles out of the current view.
        setProperties((prev) => prev.filter((p) => p._id !== property._id));
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
        setProperties((prev) => prev.filter((p) => p._id !== property._id));
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

  const filteredProperties = properties.filter((p) =>
    p.address.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <p>Loading properties...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="py-4 px-6">Property Address</TableHead>
              <TableHead className="py-4 px-6">Tenant Status</TableHead>
              <TableHead className="py-4 px-6">Managed Utilities</TableHead>
              <TableHead className="text-right py-4 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProperties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                  No properties found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProperties.map((property) => (
                <TableRow 
                  key={property._id} 
                  className={`group hover:bg-muted/50 transition-colors cursor-pointer ${property.is_archived ? 'opacity-60 bg-muted/20' : ''}`}
                  onClick={() => handleRowClick(property)}
                >
                  <TableCell className="font-semibold text-base py-5 px-6">{property.address}</TableCell>
                  <TableCell className="py-5 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      property.tenant_status === 'Occupied' 
                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                        : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                    }`}>
                      {property.tenant_status}
                    </span>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PropertyModal
        property={selectedProperty}
        companies={companies}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchProperties();
          setIsModalOpen(false);
        }}
        defaultMode={modalMode}
      />
    </div>
  );
}
