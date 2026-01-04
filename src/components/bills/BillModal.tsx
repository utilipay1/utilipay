"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BillForm } from "./BillForm";
import { BillDetails } from "./BillDetails";
import { BillSchema } from "@/lib/schemas";
import { z } from "zod";

type Bill = z.infer<typeof BillSchema>;

interface BillModalProps {
  bill: Bill | null;
  propertyName?: string;
  companyName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: "view" | "edit";
}

export function BillModal({ 
  bill, 
  propertyName,
  companyName,
  isOpen, 
  onClose, 
  onSuccess,
  defaultMode = "view"
}: BillModalProps) {
  const [mode, setMode] = useState<"view" | "edit">(defaultMode);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode, bill]);

  if (!bill) return null;

  const handleSuccess = () => {
    onSuccess();
    onClose(); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "view" ? "Bill Details" : "Edit Bill"}
          </DialogTitle>
        </DialogHeader>
        
        {mode === "view" ? (
          <BillDetails 
            bill={bill} 
            propertyName={propertyName}
            companyName={companyName}
            onEdit={() => setMode("edit")} 
          />
        ) : (
          <BillForm 
            initialData={bill} 
            mode="edit" 
            onSuccess={handleSuccess}
            onCancel={() => setMode("view")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}