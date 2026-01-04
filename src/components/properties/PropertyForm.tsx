"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropertySchema } from "@/lib/schemas";
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

const formSchema = PropertySchema;
type FormValues = z.infer<typeof formSchema>;

interface PropertyFormProps {
  initialData?: FormValues;
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PropertyForm({ initialData, mode, onSuccess, onCancel }: PropertyFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
    notes: "",
    is_archived: false,
  };

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  });

  const tenantStatus = form.watch("tenant_status");

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    try {
      const url = mode === "create" ? "/api/properties" : `/api/properties/${values._id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      // Ensure _id is not in the body for create, but is needed for the URL in edit
      // For PATCH, we send the whole body or just changes. Sending whole body is easier here.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...body } = values;

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

  return (
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
                  <Input placeholder="Enter owner name (optional)" {...field} />
                </FormControl>
                <FormMessage />
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
                  <Input placeholder="Email or phone (optional)" {...field} />
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
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Vacant">Vacant</option>
                  <option value="Occupied">Occupied</option>
                </select>
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
                    <Input placeholder="Enter tenant name (if occupied)" {...field} />
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
                    <Input placeholder="Tenant email or phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="space-y-3">
          <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Utilities Managed</FormLabel>
          <div className="grid grid-cols-2 gap-3">
            {(["Water", "Sewer", "Gas", "Electric"] as const).map((utility) => (
              <label key={utility} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                form.watch("utilities_managed").includes(utility) 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-muted/10 border-input hover:border-accent'
              }`}>
                <input
                  type="checkbox"
                  className="hidden"
                  value={utility}
                  checked={form.watch("utilities_managed").includes(utility)}
                  onChange={(e) => {
                    const current = form.getValues("utilities_managed");
                    if (e.target.checked) {
                      form.setValue("utilities_managed", [...current, utility]);
                    } else {
                      form.setValue(
                        "utilities_managed",
                        current.filter((v) => v !== utility)
                      );
                    }
                  }}
                />
                <span className="text-sm font-bold">{utility}</span>
              </label>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes about the property" {...field} />
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
  );
}