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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter property address" {...field} />
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
              <FormLabel>Tenant Status</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  <option value="Vacant">Vacant</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Utilities Managed</FormLabel>
          <div className="flex gap-4">
            {["Water", "Sewer", "Gas", "Electric"].map((utility) => (
              <label key={utility} className="flex items-center gap-2">
                <input
                  type="checkbox"
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
                {utility}
              </label>
            ))}
          </div>
        </div>

        {status === "error" && (
          <p className="text-destructive text-sm font-medium">{errorMessage || "Failed to add property"}</p>
        )}
        {status === "success" && (
          <p className="text-green-600 text-sm font-medium">Property added successfully!</p>
        )}

        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Adding..." : "Add Property"}
        </Button>
      </form>
    </Form>
  );
}
