'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useSWR from 'swr';
import { Skeleton } from '@/components/ui/skeleton';

interface Property {
  _id: string;
  address: string;
  utilities_managed: string[];
  is_archived: boolean;
}

interface Bill {
  property_id: string;
  utility_type: string;
  status: string;
  due_date: string;
  bill_date: string;
  amount: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function PortfolioTable() {
  const { data: propsData, isLoading: propsLoading } = useSWR('/api/properties?limit=1000', fetcher);
  const { data: billsData, isLoading: billsLoading } = useSWR('/api/bills?limit=1000', fetcher);

  const properties: Property[] = propsData?.data || [];
  const bills: Bill[] = billsData?.data || [];
  const isLoading = propsLoading || billsLoading;

  if (isLoading && properties.length === 0) {
    return (
      <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="py-4">Property Address</TableHead>
              <TableHead className="py-4">Utility Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell className="py-4"><Skeleton className="h-6 w-[200px]" /></TableCell>
                <TableCell className="py-4"><Skeleton className="h-6 w-[300px]" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="py-4">Property Address</TableHead>
              <TableHead className="py-4">Utility Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property._id} className="group hover:bg-muted/50 transition-colors">
                <TableCell className="font-semibold text-base py-4">{property.address}</TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-wrap gap-2">
                    {property.utilities_managed.map((utility) => {
                      const relevantBills = bills.filter(
                        (b) =>
                          b.property_id === property._id &&
                          b.utility_type === utility
                      );

                      // Priority: Overdue -> Unpaid (Real Amount) -> Paid -> Any
                      const overdueBill = relevantBills.find(b => b.status === 'Overdue');
                      
                      // Find earliest unpaid bill that is either real (amount > 0) or effectively due (bill date passed)
                      const unpaidRealBill = relevantBills
                        .filter(b => 
                          b.status === 'Unpaid' && 
                          (b.amount > 0 || new Date() >= new Date(b.bill_date))
                        )
                        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

                      const latestPaidBill = relevantBills
                        .filter(b => b.status.startsWith('Paid'))
                        .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0];

                      const displayBill = overdueBill || unpaidRealBill || latestPaidBill || relevantBills[0];

                      const status = displayBill ? displayBill.status : 'No Bill';
                      const isPaid = status.startsWith('Paid');
                      const isUnpaid = status === 'Unpaid';
                      const isOverdue = status === 'Overdue';

                      return (
                        <div
                          key={utility}
                          className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                            displayBill
                              ? isUnpaid
                                ? 'bg-muted text-foreground border-muted-foreground/30'
                                : isPaid
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : isOverdue 
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-muted text-muted-foreground border-muted-foreground/20'
                              : 'bg-muted/30 text-muted-foreground/50 border-transparent'
                          }`}
                        >
                          {utility}: {isPaid ? 'Paid' : status}
                        </div>
                      );
                    })}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
