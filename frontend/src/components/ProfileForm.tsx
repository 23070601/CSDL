import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';

interface ProfileFormProps {
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export default function ProfileForm({ onSave, isLoading = false }: ProfileFormProps) {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    address: user?.address || '',
    linkedIn: user?.linkedIn || '',
    facebook: user?.facebook || '',
    profilePicture: '', // Keep profile picture in memory only, not in localStorage
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({ ...prev, profilePicture: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // Exclude profile picture from the API request to avoid sending large base64 data
      const { profilePicture, ...dataToSend } = formData;
      
      await onSave(dataToSend);
      // Update local user state - exclude profile picture from localStorage to avoid quota exceeded
      
      setUser({
        ...user,
        ...dataToSend,
      } as any);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="card">
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 rounded-full bg-primary-600 flex items-center justify-center text-white text-4xl overflow-hidden flex-shrink-0">
            {formData.profilePicture ? (
              <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user.fullName?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-h4 text-neutral-900 mb-1">{user.fullName || 'User'}</h2>
            <p className="text-p4 text-neutral-600 mb-4">{user.email}</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-tag-sm font-semibold bg-primary-100 text-primary-700">
                {user.role}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-tag-sm font-semibold ${
                user.status === 'active' 
                  ? 'bg-status-success-bg text-status-success'
                  : 'bg-status-error-bg text-status-error'
              }`}>
                {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
              </span>
            </div>
            {isEditing && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePictureChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                >
                  Upload Photo
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
          <h3 className="text-h5 text-neutral-900">Personal Information</h3>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
            >
              Edit
            </Button>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <InfoRow label="Full Name" value={user.fullName || '-'} />
            <InfoRow label="Email" value={user.email || '-'} />
            <InfoRow label="Phone Number" value={user.phoneNumber || '-'} />
            <InfoRow label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '-'} />
            <InfoRow label="Gender" value={user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '-'} />
            <InfoRow label="Address" value={user.address || '-'} />
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <Input
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleSelectChange}
              options={[
                { value: '', label: 'Select gender' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Street address, city, state, zip code"
            />
          </div>
        )}
      </div>

      {/* Social Media Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
          <h3 className="text-h5 text-neutral-900">Social Media & Links</h3>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            {user.linkedIn && (
              <InfoRow 
                label="LinkedIn" 
                value={
                  <a href={user.linkedIn} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {user.linkedIn}
                  </a>
                }
              />
            )}
            {user.facebook && (
              <InfoRow 
                label="Facebook" 
                value={
                  <a href={user.facebook} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {user.facebook}
                  </a>
                }
              />
            )}
            {!user.linkedIn && !user.facebook && (
              <p className="text-p4 text-neutral-600">No social media links added</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="LinkedIn URL"
              name="linkedIn"
              type="url"
              value={formData.linkedIn}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/yourprofile"
            />
            <Input
              label="Facebook URL"
              name="facebook"
              type="url"
              value={formData.facebook}
              onChange={handleInputChange}
              placeholder="https://facebook.com/yourprofile"
            />
          </div>
        )}
      </div>

      {/* Account Information Section */}
      <div className="card">
        <h3 className="text-h5 text-neutral-900 mb-4">Account Information</h3>
        <div className="space-y-3">
          <InfoRow label="ID" value={user.id} />
          <InfoRow label="Account Created" value={new Date(user.createdAt).toLocaleDateString()} />
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            variant="primary"
            isLoading={isLoading}
          >
            Save Changes
          </Button>
          <Button
            onClick={() => {
              setIsEditing(false);
              setFormData({
                fullName: user?.fullName || '',
                email: user?.email || '',
                phoneNumber: user?.phoneNumber || '',
                dateOfBirth: user?.dateOfBirth || '',
                gender: user?.gender || '',
                address: user?.address || '',
                linkedIn: user?.linkedIn || '',
                facebook: user?.facebook || '',
                profilePicture: '', // Reset profile picture
              });
            }}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-p4 text-neutral-600 font-semibold">{label}</span>
      <span className="text-p4 text-neutral-900">{value}</span>
    </div>
  );
}
