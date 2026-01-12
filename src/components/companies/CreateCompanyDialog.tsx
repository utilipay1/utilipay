"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompanySchema } from "@/lib/schemas";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const formSchema = CompanySchema;
type FormValues = z.infer<typeof formSchema>;

interface CreateCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (companyId: string, companyName: string) => void;
  defaultServiceType: "Water" | "Sewer" | "Gas" | "Electric";
}

export function CreateCompanyDialog({ isOpen, onClose, onSuccess, defaultServiceType }: CreateCompanyDialogProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      service_type: defaultServiceType,
      contact_info: {
        phone: "",
        website: "",
        email: "",
      },
    },
  });

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create company");
      }

      const result = await response.json();
      onSuccess(result.insertedId, values.name);
      form.reset();
      onClose();
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add {defaultServiceType} Provider</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. City Water Dept" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <input type="hidden" {...form.register("service_type")} value={defaultServiceType} />

            <FormField
              control={form.control}
              name="contact_info.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Support number" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contact_info.website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={status === "submitting"} className="cursor-pointer">
                {status === "submitting" ? "Creating..." : "Create Company"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
