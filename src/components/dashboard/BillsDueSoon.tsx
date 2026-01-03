'use client';

import { useEffect, useState } from 'react';
import { getAlertStatus } from '@/lib/billing';
import { format } from 'date-fns';

interface Bill {
  _id: string;
  property_id: string;
  utility_type: string;
  amount: number;
  due_date: string;
  status: string;
}

export function BillsDueSoon() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBills() {
      try {
        const response = await fetch('/api/bills');
        if (response.ok) {
          const data = await response.json();
          setBills(data);
        }
      } catch (error) {
        console.error('Failed to fetch bills:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBills();
  }, []);

  const alerts = bills
    .map((bill) => ({
      ...bill,
      alertStatus: getAlertStatus(new Date(bill.due_date)),
    }))
    .filter((bill) => bill.alertStatus !== null && bill.status !== 'Paid');

  if (loading) return <div>Loading alerts...</div>;

  if (alerts.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50 text-center">
        No urgent bills due soon.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Bills Due Soon</h2>
      <div className="grid gap-4">
        {alerts.map((bill) => (
          <div
            key={bill._id}
            className={`p-4 border rounded-lg flex justify-between items-center ${
              bill.alertStatus === 'Critical'
                ? 'bg-red-50 border-red-200 text-red-900'
                : bill.alertStatus === 'Warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div>
              <div className="font-bold">{bill.utility_type}</div>
              <div className="text-sm opacity-90">
                Due: {format(new Date(bill.due_date), 'PPP')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">${bill.amount.toFixed(2)}</div>
              <div className="text-xs uppercase font-extrabold tracking-wider">
                {bill.alertStatus}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
