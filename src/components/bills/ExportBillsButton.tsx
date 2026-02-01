'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { BillSchema } from '@/lib/schemas';
import { z } from 'zod';
import { Download } from 'lucide-react';

type Bill = z.infer<typeof BillSchema>;

interface ExportBillsButtonProps {
  bills: Bill[];
  properties: Record<string, string>; // id -> address
}

export function ExportBillsButton({ bills, properties }: ExportBillsButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Dynamic import to reduce bundle size
      const xlsx = await import('xlsx');

      // Flatten and format data for Excel
      const data = bills.map((bill: Bill) => {
        const serviceFee = bill.payment?.service_fee || 0;
        return {
          'Property': properties[bill.property_id] || 'Unknown',
          'Utility Type': bill.utility_type,
          'Account Number': bill.account_number || '',
          'Status': bill.status,
          'Amount': bill.amount,
          'Service Fee': serviceFee,
          'Total': bill.amount + serviceFee,
          'Due Date': format(new Date(bill.due_date), 'MM-dd-yyyy'),
          'Bill Date': format(new Date(bill.bill_date), 'MM-dd-yyyy'),
          'Billing Start': format(new Date(bill.billing_period_start), 'MM-dd-yyyy'),
          'Billing End': format(new Date(bill.billing_period_end), 'MM-dd-yyyy'),
          'Notes': bill.notes || '',
          'Payment Date': bill.payment?.payment_date 
            ? format(new Date(bill.payment.payment_date), 'MM-dd-yyyy') 
            : '',
          'Payment Method': bill.payment?.method || '',
          'Confirmation Code': bill.payment?.confirmation_code || '',
          'Charged in Books': bill.status === 'Paid-Charged' ? 'Yes' : 'No',
        };
      });

      const worksheet = xlsx.utils.json_to_sheet(data);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Bills');
      
      // Generate and download file
      const fileName = `utilipay_bills_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
      xlsx.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Failed to export bills:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport} 
      disabled={exporting || bills.length === 0}
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      {exporting ? 'Exporting...' : 'Export to Excel'}
    </Button>
  );
}
