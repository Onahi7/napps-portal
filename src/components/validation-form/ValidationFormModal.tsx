import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { NappsMembershipValidationForm, ValidationFormData } from './NappsMembershipValidationForm';

interface ValidationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Partial<ValidationFormData>;
  onSave?: (data: ValidationFormData) => void;
}

export const ValidationFormModal: React.FC<ValidationFormModalProps> = ({
  open,
  onOpenChange,
  data,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-slate-100">
        <DialogHeader className="sr-only">
          <DialogTitle>Official NAPPS Membership Validation Form</DialogTitle>
          <DialogDescription>View and print the official membership and NNSUCE history validation form</DialogDescription>
        </DialogHeader>
        <NappsMembershipValidationForm initialData={data} onSave={onSave} isEditable={true} />
      </DialogContent>
    </Dialog>
  );
};
