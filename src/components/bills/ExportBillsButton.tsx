'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { BillSchema, CompanySchema } from '@/lib/schemas';
import { z } from 'zod';
import { Download } from 'lucide-react';

type BillWithProperty = z.infer<typeof BillSchema> & {
  property?: {
    utility_companies?: Record<string, string>;
  };
};
type Company = z.infer<typeof CompanySchema>;

interface ExportBillsButtonProps {
  bills: BillWithProperty[];
  properties: Record<string, string>; // id -> address
  companies: Record<string, Company>;
}

export function ExportBillsButton({ bills, properties, companies }: ExportBillsButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Dynamic import to reduce bundle size
      const xlsx = await import('xlsx');

      // Flatten and format data for Excel
      const data = bills.map((bill: BillWithProperty) => {
        const serviceFee = bill.payment?.service_fee || 0;
        
        // Find company name
        const companyId = bill.property?.utility_companies?.[bill.utility_type];
        const companyName = companyId ? companies[companyId]?.name : 'Unknown';

        // Robust mapping for old/new schema
        const isChargedToOwner = bill.billed_to === 'Owner' || (bill.status as string) === 'Paid-Charged';
        const isReimbursedFromTenant = bill.billed_to === 'Tenant';

        return {
          'Property': properties[bill.property_id] || 'Unknown',
          'Utility Type': bill.utility_type,
          'Utility Company': companyName,
          'Account Number': bill.account_number || '',
          'Status': (bill.status as string) === 'Paid-Charged' || (bill.status as string) === 'Paid-Uncharged' ? 'Paid' : bill.status,
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
          'Charged to Owner': isChargedToOwner ? 'Yes' : 'No',
          'Reimbursed from Tenant': isReimbursedFromTenant ? 'Yes' : 'No',
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
