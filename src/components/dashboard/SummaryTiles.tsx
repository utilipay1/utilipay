import { isSameMonth, parseISO } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

interface Bill {
  _id?: string;
  utility_type: string;
  amount: number;
  due_date: string | Date;
  status: string;
  payment?: {
    payment_date: string | Date;
  };
}

interface Property {
  _id?: string;
  address: string;
}

interface SummaryTilesProps {
  bills: Bill[];
  properties: Property[];
  isLoading?: boolean;
}

export function SummaryTiles({ bills, properties, isLoading }: SummaryTilesProps) {
  const currentDate = new Date();
  
  const unpaidBills = bills.filter(b => b.status === 'Unpaid' || b.status === 'Overdue');
  const paidBillsThisMonth = bills.filter(b => {
    if (!b.status.startsWith('Paid') || !b.payment?.payment_date) return false;
    // Handle both string and Date objects for payment_date
    const paymentDate = typeof b.payment.payment_date === 'string' 
      ? parseISO(b.payment.payment_date) 
      : b.payment.payment_date;
    return isSameMonth(paymentDate, currentDate);
  });
  
  const totalDue = unpaidBills.reduce((acc, b) => acc + b.amount, 0);
  const totalPaidThisMonth = paidBillsThisMonth.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="border rounded-xl p-6 bg-card shadow-sm">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Due</p>
        {isLoading ? (
          <Skeleton className="h-9 w-32 mt-2" />
        ) : (
          <h2 className="text-3xl font-bold mt-2 text-destructive">₹{totalDue.toLocaleString()}</h2>
        )}
      </div>
      
      <div className="border rounded-xl p-6 bg-card shadow-sm">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Paid This Month</p>
        {isLoading ? (
          <Skeleton className="h-9 w-32 mt-2" />
        ) : (
          <h2 className="text-3xl font-bold mt-2 text-primary">₹{totalPaidThisMonth.toLocaleString()}</h2>
        )}
      </div>

      <div className="border rounded-xl p-6 bg-card shadow-sm">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Properties Managed</p>
        {isLoading ? (
          <Skeleton className="h-9 w-12 mt-2" />
        ) : (
          <h2 className="text-3xl font-bold mt-2">{properties.length}</h2>
        )}
      </div>
    </div>
  );
}