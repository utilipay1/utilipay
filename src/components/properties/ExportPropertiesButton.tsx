'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { PropertySchema, CompanySchema } from '@/lib/schemas';
import { z } from 'zod';
import { Download } from 'lucide-react';

type Property = z.infer<typeof PropertySchema>;
type Company = z.infer<typeof CompanySchema>;

interface ExportPropertiesButtonProps {
  properties: Property[];
  companies: Record<string, Company>;
}

export function ExportPropertiesButton({ properties, companies }: ExportPropertiesButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Dynamic import to reduce bundle size
      const xlsx = await import('xlsx');

      // Flatten and format data for Excel
      const data = properties.map((prop: Property) => {
        // Resolve utility companies
        const getCompanyName = (type: string) => {
          const id = prop.utility_companies?.[type];
          return id ? companies[id]?.name : '---';
        };

        return {
          'Address': prop.address,
          'Owner Name': prop.owner_info?.name || '---',
          'Owner Contact': prop.owner_info?.contact || '---',
          'Tenant Status': prop.tenant_status,
          'Tenant Name': prop.tenant_info?.name || '---',
          'Tenant Contact': prop.tenant_info?.contact || '---',
          'Water Provider': getCompanyName('Water'),
          'Sewer Provider': getCompanyName('Sewer'),
          'Gas Provider': getCompanyName('Gas'),
          'Electric Provider': getCompanyName('Electric'),
          'Utilities Managed': prop.utilities_managed.join(', '),
          'Notes': prop.notes || '',
          'Archived': prop.is_archived ? 'Yes' : 'No'
        };
      });

      const worksheet = xlsx.utils.json_to_sheet(data);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Properties');
      
      // Generate and download file
      const fileName = `utilipay_properties_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
      xlsx.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Failed to export properties:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport} 
      disabled={exporting || properties.length === 0}
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      {exporting ? 'Exporting...' : 'Export to Excel'}
    </Button>
  );
}
