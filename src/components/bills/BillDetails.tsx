import { BillSchema } from "@/lib/schemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Edit, Calendar, DollarSign, FileText, Hash } from "lucide-react";
import { format } from "date-fns";

type Bill = z.infer<typeof BillSchema>;

interface BillDetailsProps {
  bill: Bill;
  propertyName?: string;
  onEdit: () => void;
}

export function BillDetails({ bill, propertyName, onEdit }: BillDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{bill.utility_type} Bill</h2>
          {propertyName && (
            <p className="text-muted-foreground">{propertyName}</p>
          )}
          <div className="flex gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
              bill.status === 'Paid-Charged' || bill.status === 'Paid-Uncharged'
                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                : bill.status === 'Overdue'
                ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
            }`}>
              {bill.status}
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
          <Edit className="w-4 h-4" />
          Edit
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Financials */}
        <div className="space-y-3 p-4 border rounded-xl bg-muted/10">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            Amount Due
          </div>
          <p className="text-3xl font-bold">₹{bill.amount.toLocaleString()}</p>
          {bill.account_number && (
             <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
               <Hash className="w-3 h-3" />
               Account: <span className="font-mono">{bill.account_number}</span>
             </div>
          )}
        </div>

        {/* Dates */}
        <div className="space-y-3 p-4 border rounded-xl bg-muted/10">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            Key Dates
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date:</span>
              <span className="font-medium">{format(new Date(bill.due_date), 'PPP')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bill Date:</span>
              <span className="font-medium">{format(new Date(bill.bill_date), 'PPP')}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-muted-foreground">Period:</span>
              <span className="font-medium text-right">
                {format(new Date(bill.billing_period_start), 'MMM d')} - {format(new Date(bill.billing_period_end), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info if paid */}
      {bill.payment && (
        <div className="space-y-3 pt-4 border-t">
           <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            Payment Record
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
               <span className="block text-muted-foreground">Date Paid</span>
               <span className="font-medium">{format(new Date(bill.payment.payment_date), 'PPP')}</span>
             </div>
             <div>
               <span className="block text-muted-foreground">Method</span>
               <span className="font-medium">{bill.payment.method}</span>
             </div>
             {bill.payment.confirmation_code && (
               <div className="col-span-2">
                 <span className="block text-muted-foreground">Confirmation Code</span>
                 <span className="font-mono bg-muted px-2 py-1 rounded">{bill.payment.confirmation_code}</span>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Notes */}
      {bill.notes && (
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            Notes
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {bill.notes}
          </p>
        </div>
      )}
    </div>
  );
}