interface Bill {
  _id: string;
  utility_type: string;
  amount: number;
  due_date: string;
  status: string;
}

interface Property {
  _id: string;
  address: string;
}

interface SummaryTilesProps {
  bills: Bill[];
  properties: Property[];
}

export function SummaryTiles({ bills, properties }: SummaryTilesProps) {
  const unpaidBills = bills.filter(b => b.status === 'Unpaid' || b.status === 'Overdue');
  const paidBills = bills.filter(b => b.status.startsWith('Paid'));
  
  const totalDue = unpaidBills.reduce((acc, b) => acc + b.amount, 0);
  const totalPaid = paidBills.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="border rounded-xl p-6 bg-card shadow-sm">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Due</p>
        <h2 className="text-3xl font-bold mt-2 text-destructive">₹{totalDue.toLocaleString()}</h2>
      </div>
      
      <div className="border rounded-xl p-6 bg-card shadow-sm">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Paid</p>
        <h2 className="text-3xl font-bold mt-2 text-primary">₹{totalPaid.toLocaleString()}</h2>
      </div>

      <div className="border rounded-xl p-6 bg-card shadow-sm">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Properties Managed</p>
        <h2 className="text-3xl font-bold mt-2">{properties.length}</h2>
      </div>
    </div>
  );
}