"use client";

import { useState } from "react";
import { CompanySchema } from "@/lib/schemas";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Save, X } from "lucide-react";

type Company = z.infer<typeof CompanySchema>;

interface ManageCompaniesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: string;
  companies: Company[];
  onRefresh: () => void;
}

export function ManageCompaniesDialog({ 
  isOpen, 
  onClose, 
  serviceType, 
  companies, 
  onRefresh 
}: ManageCompaniesDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredCompanies = companies.filter(c => c.service_type === serviceType);

  const handleEdit = (company: Company) => {
    setEditingId(company._id!);
    setEditName(company.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSave = async (id: string) => {
    if (!editName.trim()) return;
    setLoadingId(id);
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });

      if (response.ok) {
        onRefresh();
        setEditingId(null);
      }
    } catch (error) {
      console.error("Failed to update company:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? Any property using this provider will lose the reference.")) return;
    setLoadingId(id);
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to delete company:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage {serviceType} Providers</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {filteredCompanies.length === 0 ? (
            <p className="text-center text-muted-foreground italic py-8">
              No providers found.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredCompanies.map((company) => (
                <div 
                  key={company._id} 
                  className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                >
                  {editingId === company._id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <Input 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8"
                        autoFocus
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-green-600 hover:text-green-700"
                        onClick={() => handleSave(company._id!)}
                        disabled={loadingId === company._id}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-muted-foreground"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-sm truncate mr-2 flex-1">
                        {company.name}
                      </span>
                      <div className="flex gap-1 shrink-0">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleEdit(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(company._id!)}
                          disabled={loadingId === company._id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
