"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BillSchema } from "@/lib/schemas";
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

const formSchema = BillSchema.omit({ _id: true, payment: true }).extend({
  amount: z.coerce.number().min(0),
  billing_period_start: z.string(),
  billing_period_end: z.string(),
  bill_date: z.string(),
  due_date: z.string(),
  is_archived: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;
type Bill = z.infer<typeof BillSchema>;

interface BillFormProps {
  initialData?: Bill;
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Property {
  _id: string;
  address: string;
  utilities_managed: string[];
}

export function BillForm({ initialData, mode, onSuccess, onCancel }: BillFormProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const defaultValues: FormValues = initialData ? {
    property_id: initialData.property_id,
    utility_type: initialData.utility_type,
    amount: initialData.amount,
    account_number: initialData.account_number || "",
    billing_period_start: new Date(initialData.billing_period_start).toISOString().split('T')[0],
    billing_period_end: new Date(initialData.billing_period_end).toISOString().split('T')[0],
    bill_date: new Date(initialData.bill_date).toISOString().split('T')[0],
    due_date: new Date(initialData.due_date).toISOString().split('T')[0],
    status: initialData.status,
    notes: initialData.notes || "",
    is_archived: initialData.is_archived,
  } : {
    property_id: "",
    utility_type: "Water",
    amount: 0,
    account_number: "",
    billing_period_start: new Date().toISOString().split('T')[0],
    billing_period_end: new Date().toISOString().split('T')[0],
    bill_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    status: "Unpaid",
    notes: "",
    is_archived: false,
  };

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  });

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch("/api/properties");
        if (response.ok) {
          const data = await response.json();
          setProperties(data);
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    }
    fetchProperties();
  }, []);

  const selectedPropertyId = form.watch("property_id");
  const selectedProperty = properties.find(p => p._id === selectedPropertyId);
  const utilityOptions = selectedProperty ? selectedProperty.utilities_managed : ["Water", "Sewer", "Gas", "Electric"];

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    try {
      const url = mode === "create" ? "/api/bills" : `/api/bills/${initialData?._id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${mode} bill`);
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
          name="property_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={mode === 'edit'} // Usually property doesn't change for a bill, but allows if needed. Let's keep it enabled or disabled based on preference. Current EditBillModal allows it.
                >
                  <option value="">Select a property</option>
                  {properties.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.address}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="utility_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Utility Type</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {!selectedProperty && <option value="">Select a property first</option>}
                    {utilityOptions.map((utility) => (
                      <option key={utility} value={utility}>
                        {utility}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="Enter bill amount" 
                    {...field} 
                    onChange={e => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : parseFloat(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="account_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input placeholder="Utility account number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="billing_period_start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Period Start</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billing_period_end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Period End</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="bill_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bill Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes about the bill" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {status === "error" && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {errorMessage || `Failed to ${mode} bill`}
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
              ? (mode === "create" ? "Adding..." : "Updating...") 
              : (mode === "create" ? "Add Bill" : "Update Bill")}
          </Button>
        </div>
      </form>
    </Form>
  );
}