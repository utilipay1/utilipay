"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropertySchema, CompanySchema } from "@/lib/schemas";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CreateCompanyDialog } from "@/components/companies/CreateCompanyDialog";
import { ManageCompaniesDialog } from "@/components/companies/ManageCompaniesDialog";

const formSchema = PropertySchema;
type FormValues = z.infer<typeof formSchema>;
type Company = z.infer<typeof CompanySchema>;

interface PropertyFormProps {
  initialData?: FormValues;
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PropertyForm({ initialData, mode, onSuccess, onCancel }: PropertyFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  
  // State for creating/managing companies
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [activeUtilityForCreation, setActiveUtilityForCreation] = useState<"Water" | "Sewer" | "Gas" | "Electric" | null>(null);
  const [activeUtilityForManage, setActiveUtilityForManage] = useState<string | null>(null);

  const defaultValues: FormValues = initialData || {
    address: "",
    owner_info: {
      name: "",
      contact: "",
    },
    tenant_status: "Vacant",
    tenant_info: {
      name: "",
      contact: "",
    },
    utilities_managed: [],
    utility_companies: {},
    notes: "",
    is_archived: false,
  };

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues,
    shouldUnregister: true,
  });

  const tenantStatus = form.watch("tenant_status");
  const utilitiesManaged = form.watch("utilities_managed") || [];

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies?limit=1000");
      if (response.ok) {
        const json = await response.json();
        setCompanies(json.data || []); 
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    try {
      const url = mode === "create" ? "/api/properties" : `/api/properties/${values._id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...body } = values;

      // Clean up utility_companies to remove any undefined or null values
      if (body.utility_companies) {
        Object.keys(body.utility_companies).forEach(key => {
          if (body.utility_companies[key] === undefined || body.utility_companies[key] === null) {
            delete body.utility_companies[key];
          }
        });
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${mode} property`);
      }

      setStatus("success");
      if (mode === "create") form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  }

  const handleCompanyCreateSuccess = (companyId: string, companyName: string) => {
    // Add new company to local list
    const newCompany: Company = {
      _id: companyId,
      name: companyName,
      service_type: activeUtilityForCreation!,
    };
    setCompanies([...companies, newCompany]);
    
    // Auto-select it
    if (activeUtilityForCreation) {
      const currentCompanies = form.getValues("utility_companies") || {};
      form.setValue("utility_companies", {
        ...currentCompanies,
        [activeUtilityForCreation]: companyId
      });
    }
    
    setActiveUtilityForCreation(null);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter property address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="owner_info.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter owner name (optional)" {...field} value={field.value ?? ""} />
                                </FormControl>                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="owner_info.contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Contact</FormLabel>
                                <FormControl>
                                  <Input placeholder="Email or phone (optional)" {...field} value={field.value ?? ""} />
                                </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tenant_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tenant Status</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Vacant">Vacant</SelectItem>
                      <SelectItem value="Occupied">Occupied</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {tenantStatus === "Occupied" && (
            <div className="grid gap-4 md:grid-cols-2 p-4 border rounded-lg bg-muted/30 animate-in fade-in slide-in-from-top-2">
              <FormField
                control={form.control}
                name="tenant_info.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenant Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter tenant name (if occupied)" {...field} value={field.value ?? ""} />
                                  </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tenant_info.contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenant Contact</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Tenant email or phone" {...field} value={field.value ?? ""} />
                                  </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="space-y-3">
            <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Utilities & Providers</FormLabel>
            <div className="grid md:grid-cols-2 gap-4">
              {(["Water", "Sewer", "Gas", "Electric"] as const).map((utility) => {
                const isChecked = utilitiesManaged.includes(utility);
                const availableCompanies = companies.filter(c => c.service_type === utility);
                
                return (
                  <div key={utility} className={`border rounded-lg p-4 transition-all ${
                    isChecked ? 'border-primary bg-primary/5' : 'bg-muted/10 border-input'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <Checkbox
                        id={`util-${utility}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("utilities_managed") || [];
                          if (checked) {
                            form.setValue("utilities_managed", [...current, utility]);
                          } else {
                            form.setValue(
                              "utilities_managed",
                              current.filter((v) => v !== utility)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`util-${utility}`} className="text-sm font-bold cursor-pointer">
                        {utility}
                      </Label>
                    </div>

                    {isChecked && (
                      <div className="pl-7 animate-in fade-in slide-in-from-top-1">
                        <FormField
                          control={form.control}
                          name={`utility_companies.${utility}`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                value={field.value as string}
                                onValueChange={(val) => {
                                  if (val === "NEW") {
                                    setActiveUtilityForCreation(utility);
                                    setIsCreateDialogOpen(true);
                                  } else if (val === "MANAGE") {
                                    setActiveUtilityForManage(utility);
                                    setIsManageDialogOpen(true);
                                  } else {
                                    field.onChange(val);
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder={`Select ${utility} Provider`} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableCompanies.length > 0 ? (
                                    availableCompanies.map((c) => (
                                      <SelectItem key={c._id} value={c._id!}>{c.name}</SelectItem>
                                    ))
                                  ) : (
                                    <div className="p-2 text-xs text-muted-foreground text-center">No companies found</div>
                                  )}
                                  <SelectSeparator />
                                  <SelectItem value="NEW" className="font-bold text-primary">
                                    + Create New Provider
                                  </SelectItem>
                                  <SelectItem value="MANAGE" className="font-medium text-muted-foreground">
                                    Manage Providers...
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Additional notes about the property" {...field} value={field.value ?? ""} />
                              </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {status === "error" && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              {errorMessage || `Failed to ${mode} property`}
            </div>
          )}
          
          <div className="flex gap-3">
            {onCancel && (
               <Button 
                 type="button" 
                 variant="outline" 
                 className="flex-1"
                 onClick={onCancel}
               >
                 Cancel
               </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1 font-bold transition-transform active:scale-[0.98]" 
              disabled={status === "submitting"}
            >
              {status === "submitting" 
                ? (mode === "create" ? "Adding..." : "Saving...") 
                : (mode === "create" ? "Add Property" : "Save Changes")}
            </Button>
          </div>
        </form>
      </Form>

      {activeUtilityForCreation && (
        <CreateCompanyDialog 
          isOpen={isCreateDialogOpen} 
          onClose={() => setIsCreateDialogOpen(false)} 
          onSuccess={handleCompanyCreateSuccess}
          defaultServiceType={activeUtilityForCreation}
        />
      )}

      {activeUtilityForManage && (
        <ManageCompaniesDialog
          isOpen={isManageDialogOpen}
          onClose={() => setIsManageDialogOpen(false)}
          serviceType={activeUtilityForManage}
          companies={companies}
          onRefresh={fetchCompanies}
        />
      )}
    </>
  );
}