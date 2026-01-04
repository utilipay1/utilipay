"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PropertyForm } from "./PropertyForm";
import { PropertyDetails } from "./PropertyDetails";
import { PropertySchema, CompanySchema } from "@/lib/schemas";
import { z } from "zod";

type Property = z.infer<typeof PropertySchema>;
type Company = z.infer<typeof CompanySchema>;

interface PropertyModalProps {
  property: Property | null;
  companies?: Record<string, Company>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: "view" | "edit";
}

export function PropertyModal({ 
  property, 
  companies,
  isOpen, 
  onClose, 
  onSuccess,
  defaultMode = "view"
}: PropertyModalProps) {
  const [mode, setMode] = useState<"view" | "edit">(defaultMode);

  // Reset mode when the modal opens/closes or property changes
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode, property]);

  if (!property) return null;

  const handleSuccess = () => {
    onSuccess();
    if (mode === 'edit') {
       // If we just edited, maybe go back to view mode to show updated details?
       // Or just close? Usually closing is fine, but if we want to see changes:
       // For now, let's close the modal as it's simpler.
       onClose(); 
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "view" ? "Property Details" : "Edit Property"}
          </DialogTitle>
        </DialogHeader>
        
        {mode === "view" ? (
          <PropertyDetails 
            property={property} 
            companies={companies}
            onEdit={() => setMode("edit")} 
          />
        ) : (
          <PropertyForm 
            initialData={property} 
            mode="edit" 
            onSuccess={handleSuccess}
            onCancel={() => setMode("view")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}