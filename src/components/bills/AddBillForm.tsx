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

const formSchema = BillSchema.omit({ _id: true });
type FormValues = z.infer<typeof formSchema>;

export function AddBillForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [properties, setProperties] = useState<{ _id: string; address: string }[]>([]);

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

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      property_id: "",
      utility_type: "Water",
      amount: 0,
      account_number: "",
      billing_period_start: new Date(),
      billing_period_end: new Date(),
      bill_date: new Date(),
      due_date: new Date(),
      status: "Unpaid",
    },
  });

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    try {
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to add bill");
      }

      setStatus("success");
      form.reset();
    } catch (error: unknown) {
      setStatus("error");
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      setErrorMessage(message);
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
              <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Select Property</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-muted-foreground/20 bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Choose a registered property</option>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="utility_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Utility Type</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-muted-foreground/20 bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Amount (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field} 
                    className="bg-muted/20 border-muted-foreground/20"
                    value={field.value === 0 ? "" : field.value}
                    onChange={(e) => {
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

        <div className="grid grid-cols-2 gap-4 border-t pt-6 border-muted">
          <FormField
            control={form.control}
            name="billing_period_start"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Period Start</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    className="bg-muted/20 border-muted-foreground/20"
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : (field.value as string) || ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
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
                <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Period End</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    className="bg-muted/20 border-muted-foreground/20"
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : (field.value as string) || ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bill_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Issue Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    className="bg-muted/20 border-muted-foreground/20"
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : (field.value as string) || ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
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
                <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground font-bold text-black dark:text-white">Payment Deadline</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    className="bg-muted/20 border-black dark:border-white focus:ring-black"
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : (field.value as string) || ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {status === "error" && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {errorMessage || "Failed to add bill"}
          </div>
        )}
        {status === "success" && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-sm font-medium text-center">
            Bill recorded successfully!
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 font-bold py-6 rounded-xl transition-transform active:scale-[0.98]" 
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Submitting Data..." : "Submit New Bill Entry"}
        </Button>
      </form>
    </Form>
  );
}
