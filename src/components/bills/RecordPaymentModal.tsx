'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BillSchema } from '@/lib/schemas';

const paymentFormSchema = z.object({
  payment_date: z.string().min(1, 'Payment date is required'),
  method: z.enum(['Operating A/C', 'Credit Card', 'Other']),
  method_other: z.string().optional(),
  confirmation_code: z.string().optional(),
  service_fee: z.coerce.number().min(0).default(0),
});

type Bill = z.infer<typeof BillSchema>;

interface RecordPaymentModalProps {
  bill: Bill;
  onPaymentRecorded: () => void;
}

export function RecordPaymentModal({ bill, onPaymentRecorded }: RecordPaymentModalProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(paymentFormSchema) as any,
    defaultValues: {
      payment_date: new Date().toISOString().split('T')[0],
      method: 'Operating A/C',
      method_other: '',
      confirmation_code: '',
      service_fee: 0,
    },
  });

  const method = form.watch('method');
  const serviceFee = form.watch('service_fee') || 0;
  const totalPaid = bill.amount + serviceFee;

  async function onSubmit(values: z.infer<typeof paymentFormSchema>) {
    try {
      const response = await fetch(`/api/bills/${bill._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Paid-Uncharged',
          payment: {
            payment_date: new Date(values.payment_date),
            method: values.method === 'Other' ? `Other: ${values.method_other}` : values.method,
            confirmation_code: values.confirmation_code,
            service_fee: values.service_fee,
          },
        }),
      });

      if (response.ok) {
        setOpen(false);
        onPaymentRecorded();
      }
    } catch (error) {
      console.error('Failed to record payment:', error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white transition-colors">
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Confirm payment details for this utility bill.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/30 p-4 rounded-lg space-y-1 text-sm border">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Utility Type:</span>
            <span className="font-bold">{bill.utility_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bill Amount:</span>
            <span className="font-bold">₹{bill.amount.toLocaleString()}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

            {method === 'Other' && (
              <FormField
                control={form.control}
                name="method_other"
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

            <FormField
              control={form.control}
              name="confirmation_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmation Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Utility confirmation number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service/Convenience Fee</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t border-dashed flex justify-between items-center">
              <span className="text-lg font-medium">Total Paid:</span>
              <span className="text-2xl font-black text-primary">₹{totalPaid.toLocaleString()}</span>
            </div>

            <Button type="submit" className="w-full font-bold py-6 rounded-xl mt-4">
              Record Payment
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}