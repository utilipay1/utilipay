"use client";

import { useState, useEffect, useMemo } from "react";
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
import { DatePicker } from "@/components/ui/date-picker";

const formSchema = BillSchema.omit({ _id: true }).extend({
  amount: z.coerce.number().min(0),
  billing_period_start: z.date(),
  billing_period_end: z.date(),
  bill_date: z.date(),
  due_date: z.date(),
  is_archived: z.boolean().default(false),
  payment: z.object({
    payment_date: z.date(),
    method: z.string(),
    method_other: z.string().optional(),
    confirmation_code: z.string().nullish(),
    service_fee: z.coerce.number().min(0).default(0),
  }).optional(),
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

  const defaultValues: FormValues = useMemo(() => initialData ? {
    property_id: initialData.property_id,
    utility_type: initialData.utility_type,
    amount: initialData.amount,
    account_number: initialData.account_number || "",
    billing_period_start: new Date(initialData.billing_period_start),
    billing_period_end: new Date(initialData.billing_period_end),
    bill_date: new Date(initialData.bill_date),
    due_date: new Date(initialData.due_date),
    status: (initialData.status as string) === "Paid-Charged" || (initialData.status as string) === "Paid-Uncharged" 
      ? "Paid" 
      : initialData.status,
    billed_to: (initialData.billed_to as string) === "None" || !initialData.billed_to 
      ? "Owner" 
      : initialData.billed_to,
    notes: initialData.notes || "",
    is_archived: initialData.is_archived,
    payment: initialData.payment ? {
      payment_date: new Date(initialData.payment.payment_date),
      method: initialData.payment.method.startsWith("Other: ") ? "Other" : initialData.payment.method,
      method_other: initialData.payment.method.startsWith("Other: ") ? initialData.payment.method.replace("Other: ", "") : "",
      confirmation_code: initialData.payment.confirmation_code || "",
      service_fee: initialData.payment.service_fee,
    } : undefined,
  } : {
    property_id: "",
    utility_type: "Water",
    amount: 0,
    account_number: "",
    billing_period_start: new Date(),
    billing_period_end: new Date(),
    bill_date: new Date(),
    due_date: new Date(),
    status: "Unpaid",
    billed_to: "Owner",
    notes: "",
    is_archived: false,
    payment: {
      payment_date: new Date(),
      method: "Operating A/C",
      method_other: "",
      confirmation_code: "",
      service_fee: 0,
    },
  }, [initialData]);

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  });

  // Sync form with initialData when it changes
  useEffect(() => {
    if (initialData) {
      form.reset(defaultValues);
    } else {
      form.reset(defaultValues);
    }
  }, [initialData, form, defaultValues]);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch("/api/properties?limit=1000");
        if (response.ok) {
          const json = await response.json();
          setProperties(json.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    }
    fetchProperties();
  }, []);

  const selectedPropertyId = form.watch("property_id");
  const billStatus = form.watch("status");
  const paymentMethod = form.watch("payment.method");
  const selectedProperty = properties.find(p => p._id === selectedPropertyId);
  const utilityOptions = selectedProperty ? selectedProperty.utilities_managed : ["Water", "Sewer", "Gas", "Electric"];

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    try {
      const url = mode === "create" ? "/api/bills" : `/api/bills/${initialData?._id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      // Final data preparation - create a copy to avoid mutating form state
      const { payment, ...rest } = values;
      let finalPayment = payment;

      // If status is not Paid, remove payment data
      if (values.status !== "Paid") {
        finalPayment = undefined;
      } else if (finalPayment) {
        // Handle "Other" method prefix
        if (finalPayment.method === "Other") {
          finalPayment.method = `Other: ${finalPayment.method_other || ""}`;
        }
        // Remove helper field before sending to API
        delete finalPayment.method_other;
      }

      const submissionData = {
        ...rest,
        payment: finalPayment,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
                <Input 
                  placeholder="Utility account number" 
                  {...field} 
                  value={field.value ?? ""} 
                />
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
              <FormItem className="flex flex-col">
                <FormLabel>Billing Period Start</FormLabel>
                <FormControl>
                  <DatePicker 
                    date={field.value} 
                    setDate={field.onChange} 
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
              <FormItem className="flex flex-col">
                <FormLabel>Billing Period End</FormLabel>
                <FormControl>
                  <DatePicker 
                    date={field.value} 
                    setDate={field.onChange} 
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
              <FormItem className="flex flex-col">
                <FormLabel>Bill Date</FormLabel>
                <FormControl>
                  <DatePicker 
                    date={field.value} 
                    setDate={field.onChange} 
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
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <DatePicker 
                    date={field.value} 
                    setDate={field.onChange} 
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billed_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billed To</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Tenant">Tenant</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {billStatus === "Paid" && (
          <div className="space-y-4 p-4 border rounded-xl bg-muted/20 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">Payment Details</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="payment.payment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <DatePicker 
                        date={field.value} 
                        setDate={field.onChange} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment.method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                      >
                        <option value="Operating A/C">Operating A/C</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {paymentMethod === "Other" && (
              <FormField
                control={form.control}
                name="payment.method_other"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-top-1">
                    <FormLabel>Nature of Payment</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe the payment method" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="payment.confirmation_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmation Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Transaction ID / Ref" 
                        {...field} 
                        value={field.value ?? ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment.service_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Fee (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                        onChange={e => {
                          const value = e.target.value;
                          field.onChange(value === "" ? 0 : parseFloat(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes about the bill" 
                  {...field} 
                  value={field.value ?? ""} 
                />
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