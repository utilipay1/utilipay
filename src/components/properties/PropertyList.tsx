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

export function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    <div className="space-y-4">
      <Input
        placeholder="Search properties..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Utilities</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProperties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No properties found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProperties.map((property) => (
                <TableRow key={property._id}>
                  <TableCell className="font-medium">{property.address}</TableCell>
                  <TableCell>{property.tenant_status}</TableCell>
                  <TableCell>{property.utilities_managed.join(", ")}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchive(property._id)}
                    >
                      Archive
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
