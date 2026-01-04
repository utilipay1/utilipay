"use client";

import { useEffect, useState } from "react";
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
import { Edit, Archive } from "lucide-react";
import { PropertySchema } from "@/lib/schemas";
import { z } from "zod";

type Property = z.infer<typeof PropertySchema>;

export function PropertyList({ search = "" }: { search?: string }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      const response = await fetch("/api/properties");
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(e: React.MouseEvent, id: string) {
    e.stopPropagation(); // Prevent row click
    if (!confirm("Are you sure you want to archive this property?")) return;
    
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_archived: true }),
      });

      if (response.ok) {
        setProperties((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (error) {
      console.error("Failed to archive property:", error);
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
                  className="group hover:bg-muted/50 transition-colors cursor-pointer"
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
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleEditClick(e, property)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Edit Property"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleArchive(e, property._id!)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                        title="Archive Property"
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
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
