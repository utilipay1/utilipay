import { BillSchema } from "@/lib/schemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Edit, Calendar, DollarSign, FileText, Hash } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Bill = z.infer<typeof BillSchema>;

interface BillDetailsProps {
  bill: Bill;
  propertyName?: string;
  companyName?: string;
  onEdit: () => void;
}

export function BillDetails({ bill, propertyName, companyName, onEdit }: BillDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{bill.utility_type} Bill</h2>
          {companyName && (
            <div className="text-lg font-semibold text-primary">{companyName}</div>
          )}
          {propertyName && (
            <p className="text-muted-foreground">{propertyName}</p>
          )}
          <div className="flex gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
              bill.status.startsWith('Paid')
                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                : bill.status === 'Overdue'
                ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
            }`}>
              {bill.status.startsWith('Paid') ? 'Paid' : bill.status}
            </span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              (bill.billed_to === 'Owner' || (bill.billed_to as string) === 'None' || !bill.billed_to) && "bg-slate-50 text-slate-700 border-slate-200",
              bill.billed_to === 'Tenant' && "bg-indigo-50 text-indigo-700 border-indigo-100"
            )}>
              Billed to {(bill.billed_to as string) === 'None' || !bill.billed_to ? 'Owner' : bill.billed_to}
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
          <Edit className="w-4 h-4" />
          Edit
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
           <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              Payment Record
            </div>
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 text-[10px] font-bold uppercase tracking-widest hover:text-primary">
              <Edit className="w-3 h-3 mr-1" />
              Edit Record
            </Button>
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
             <div>
               <span className="block text-muted-foreground">Service Fee</span>
               <span className="font-medium">₹{(bill.payment.service_fee || 0).toLocaleString()}</span>
             </div>
             <div>
               <span className="block text-muted-foreground font-bold">Total Paid</span>
               <span className="font-bold text-primary">₹{(bill.amount + (bill.payment.service_fee || 0)).toLocaleString()}</span>
             </div>
             {bill.payment.confirmation_code && (
               <div className="col-span-2">
                 <span className="block text-muted-foreground">Confirmation Code</span>
                 <span className="font-mono bg-muted px-2 py-1 rounded w-fit">{bill.payment.confirmation_code}</span>
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