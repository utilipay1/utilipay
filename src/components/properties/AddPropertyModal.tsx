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
import { PropertyForm } from './PropertyForm';

interface AddPropertyModalProps {
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function AddPropertyModal({ trigger, onSuccess }: AddPropertyModalProps) {
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
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Onboard a new property into the system.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <PropertyForm mode="create" onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
