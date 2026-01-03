'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { AddBillForm } from './AddBillForm';

interface AddBillModalProps {
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function AddBillModal({ trigger, onSuccess }: AddBillModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onSuccess) onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Bill</DialogTitle>
          <DialogDescription>
            Manually enter a utility bill for a specific property.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AddBillForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}