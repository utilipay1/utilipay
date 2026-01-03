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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Property {
  _id: string;
  address: string;
  tenant_status: string;
  utilities_managed: string[];
  is_archived: boolean;
}

export function PropertyList({ search = "" }: { search?: string }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function handleArchive(id: string) {
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
                <TableRow key={property._id} className="group hover:bg-muted/50 transition-colors">
                  <TableCell className="font-semibold text-base py-5 px-6">{property.address}</TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground border-muted-foreground/20">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchive(property._id)}
                      className="border-muted-foreground/20 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                      Archive Property
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
