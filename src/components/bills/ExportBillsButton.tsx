'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import * as xlsx from 'xlsx';
import { format } from 'date-fns';
import { BillSchema } from '@/lib/schemas';
import { z } from 'zod';

type Bill = z.infer<typeof BillSchema>;

export function ExportBillsButton() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/bills');
      if (response.ok) {
        const bills = await response.json();
        
        // Flatten and format data for Excel
        const data = bills.map((bill: Bill) => ({
          'Utility Type': bill.utility_type,
          'Amount': bill.amount,
          'Due Date': format(new Date(bill.due_date), 'yyyy-MM-dd'),
          'Status': bill.status,
          'Payment Date': bill.payment?.payment_date 
            ? format(new Date(bill.payment.payment_date), 'yyyy-MM-dd') 
            : '',
          'Payment Method': bill.payment?.method || '',
          'Confirmation Code': bill.payment?.confirmation_code || '',
          'Service Fee': bill.payment?.service_fee || 0,
        }));

        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Bills');
        
        // Generate and download file
        const fileName = `utilipay_bills_${format(new Date(), 'yyyyMMdd')}.xlsx`;
        xlsx.writeFile(workbook, fileName);
      }
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
      disabled={exporting}
    >
      {exporting ? 'Exporting...' : 'Export to Excel'}
    </Button>
  );
}
