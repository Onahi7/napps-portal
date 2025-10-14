import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CameraCapture } from '@/components/ui/camera-capture';
import { toast } from 'sonner';

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  proprietorData: {
    _id?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    schoolName?: string;
    passportPhotoUrl?: string;
    email: string;
    phone: string;
  };
  onSave: (updatedData: Partial<typeof proprietorData>) => void;
}

export const EditProfileDialog = ({ open, onClose, proprietorData, onSave }: EditProfileDialogProps) => {
  const [formData, setFormData] = useState({
    firstName: proprietorData.firstName || '',
    middleName: proprietorData.middleName || '',
    lastName: proprietorData.lastName || '',
    schoolName: proprietorData.schoolName || '',
    passportPhotoUrl: proprietorData.passportPhotoUrl || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
      
      const response = await fetch(`${API_BASE_URL}/proprietors/${proprietorData._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          schoolName: formData.schoolName,
          passportPhotoUrl: formData.passportPhotoUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      
      // Update localStorage
      const currentData = JSON.parse(localStorage.getItem('proprietor') || '{}');
      const mergedData = { ...currentData, ...updatedData };
      localStorage.setItem('proprietor', JSON.stringify(mergedData));
      
      onSave(updatedData);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Edit Profile</DialogTitle>
          <DialogDescription className="text-sm">
            Update your personal information and school name
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Passport Photo */}
          <div className="space-y-2">
            <Label>Passport Photo</Label>
            <CameraCapture
              value={formData.passportPhotoUrl}
              onChange={(url) => setFormData({ ...formData, passportPhotoUrl: url })}
              maxSizeMB={5}
              folder="napps/proprietors/passports"
            />
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                placeholder="Enter first name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                placeholder="Enter middle name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/* School Name */}
          <div className="space-y-2">
            <Label htmlFor="schoolName">
              School Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="schoolName"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              required
              placeholder="Enter school name"
            />
            <p className="text-xs text-muted-foreground">
              Correct any spelling errors in your school name
            </p>
          </div>

          {/* Read-only fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Email (cannot be changed)</Label>
              <Input value={proprietorData.email} disabled />
            </div>

            <div className="space-y-2">
              <Label>Phone (cannot be changed)</Label>
              <Input value={proprietorData.phone} disabled />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
