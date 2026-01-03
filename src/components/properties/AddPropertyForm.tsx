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

const formSchema = PropertySchema.omit({ _id: true });
type FormValues = z.infer<typeof formSchema>;

export function AddPropertyForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      tenant_status: "Vacant",
      utilities_managed: [],
      is_archived: false,
    },
  });

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to add property");
      }

      setStatus("success");
      form.reset();
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message || "An unexpected error occurred");
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
              <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Property Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 123 Main St, Apartment 4B" {...field} className="bg-muted/20 border-muted-foreground/20 focus:border-black dark:focus:border-white transition-colors" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tenant_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Occupancy Status</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-muted-foreground/20 bg-muted/20 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Vacant">Vacant</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel className="text-xs uppercase font-black tracking-widest text-muted-foreground">Utilities to Track</FormLabel>
          <div className="grid grid-cols-2 gap-3">
            {["Water", "Sewer", "Gas", "Electric"].map((utility) => (
              <label key={utility} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                form.watch("utilities_managed").includes(utility as any) 
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                : 'bg-muted/10 border-muted-foreground/10 hover:border-muted-foreground/30'
              }`}>
                <input
                  type="checkbox"
                  className="hidden"
                  value={utility}
                  checked={form.watch("utilities_managed").includes(utility as any)}
                  onChange={(e) => {
                    const current = form.getValues("utilities_managed");
                    if (e.target.checked) {
                      form.setValue("utilities_managed", [...current, utility as any]);
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

        {status === "error" && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {errorMessage || "Failed to add property"}
          </div>
        )}
        {status === "success" && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-sm font-medium text-center">
            Property added successfully!
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 font-bold py-6 rounded-xl transition-transform active:scale-[0.98]" 
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Registering Property..." : "Register New Property"}
        </Button>
      </form>
    </Form>
  );
}
