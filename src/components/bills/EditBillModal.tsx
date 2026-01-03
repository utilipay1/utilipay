'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BillSchema } from "@/lib/schemas";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
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

// Extend the schema to allow empty string for amount during editing
const formSchema = BillSchema.omit({ _id: true }).extend({
  amount: z.coerce.number().min(0),
  // Override dates to be strings for form handling
  billing_period_start: z.string(),
  billing_period_end: z.string(),
  bill_date: z.string(),
  due_date: z.string(),
});

type FormValues = z.infer<typeof formSchema>;
type Bill = z.infer<typeof BillSchema>;

interface EditBillModalProps {
  bill: Bill;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

interface Property {
  _id: string;
  address: string;
}

export function EditBillModal({ bill, trigger, onSuccess }: EditBillModalProps) {
  const [open, setOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      property_id: bill.property_id,
      utility_type: bill.utility_type,
      amount: bill.amount,
      account_number: bill.account_number || "",
      billing_period_start: new Date(bill.billing_period_start).toISOString().split('T')[0],
      billing_period_end: new Date(bill.billing_period_end).toISOString().split('T')[0],
      bill_date: new Date(bill.bill_date).toISOString().split('T')[0],
      due_date: new Date(bill.due_date).toISOString().split('T')[0],
      status: bill.status,
      notes: bill.notes || "",
    },
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
    if (open) {
        fetchProperties();
    }
  }, [open]);

  // Reset form values when bill prop changes or modal opens
  useEffect(() => {
      if (open) {
        form.reset({
            property_id: bill.property_id,
            utility_type: bill.utility_type,
            amount: bill.amount,
            account_number: bill.account_number || "",
            billing_period_start: new Date(bill.billing_period_start).toISOString().split('T')[0],
            billing_period_end: new Date(bill.billing_period_end).toISOString().split('T')[0],
            bill_date: new Date(bill.bill_date).toISOString().split('T')[0],
            due_date: new Date(bill.due_date).toISOString().split('T')[0],
            status: bill.status,
            notes: bill.notes || "",
        });
      }
  }, [bill, open, form]);


  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    try {
      const response = await fetch(`/api/bills/${bill._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update bill");
      }

      setStatus("success");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Bill</DialogTitle>
          <DialogDescription>
            Update bill details.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
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
                        <option value="Water">Water</option>
                        <option value="Sewer">Sewer</option>
                        <option value="Gas">Gas</option>
                        <option value="Electric">Electric</option>
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
                {errorMessage || "Failed to update bill"}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full font-bold py-6 rounded-xl transition-transform active:scale-[0.98]" 
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Updating Bill..." : "Update Bill"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}