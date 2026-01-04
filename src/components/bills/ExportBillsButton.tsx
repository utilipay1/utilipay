'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import * as xlsx from 'xlsx';
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
      // Flatten and format data for Excel
      const data = bills.map((bill: Bill) => ({
        'Property': properties[bill.property_id] || 'Unknown',
        'Utility Type': bill.utility_type,
        'Account Number': bill.account_number || '',
        'Status': bill.status,
        'Amount': bill.amount,
        'Due Date': format(new Date(bill.due_date), 'yyyy-MM-dd'),
        'Bill Date': format(new Date(bill.bill_date), 'yyyy-MM-dd'),
        'Billing Start': format(new Date(bill.billing_period_start), 'yyyy-MM-dd'),
        'Billing End': format(new Date(bill.billing_period_end), 'yyyy-MM-dd'),
        'Notes': bill.notes || '',
        'Payment Date': bill.payment?.payment_date 
          ? format(new Date(bill.payment.payment_date), 'yyyy-MM-dd') 
          : '',
        'Payment Method': bill.payment?.method || '',
        'Confirmation Code': bill.payment?.confirmation_code || '',
        'Service Fee': bill.payment?.service_fee || 0,
        'Charged in Books': bill.status === 'Paid-Charged' ? 'Yes' : 'No',
      }));

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
