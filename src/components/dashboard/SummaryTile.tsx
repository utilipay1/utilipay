import { format } from 'date-fns';

interface Bill {
  _id: string;
  utility_type: string;
  amount: number;
  due_date: string;
  status: string;
}

interface SummaryTileProps {
  bills: Bill[];
}

export function SummaryTile({ bills }: SummaryTileProps) {
  const pendingBills = bills.filter(b => b.status !== 'Paid');
  const totalDue = pendingBills.reduce((acc, b) => acc + b.amount, 0);
  const nextThree = [...pendingBills]
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="border rounded-2xl p-8 bg-black text-white dark:bg-white dark:text-black shadow-lg flex flex-col justify-center">
        <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Total Due This Month</p>
        <h2 className="text-5xl font-extrabold mt-2">₹{totalDue.toLocaleString()}</h2>
      </div>
      
      <div className="border rounded-2xl p-8 bg-card shadow-sm flex flex-col justify-center">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Upcoming Bills</p>
        <div className="space-y-4">
          {nextThree.length > 0 ? (
            nextThree.map(bill => (
              <div key={bill._id} className="flex justify-between items-center border-b border-muted pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="font-semibold">{bill.utility_type}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(bill.due_date), 'MMM d, yyyy')}</p>
                </div>
                <p className="font-bold">₹{bill.amount}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No pending bills.</p>
          )}
        </div>
      </div>
    </div>
  );
}
