import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ProfileForm from '@/components/ProfileForm';
import { apiClient } from '@/utils/api';
import { useAuthStore } from '@/store/authStore';

export default function AdminProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    // Fetch fresh profile data from backend on page load
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      if (!user?.id) {
        console.error('No user ID found');
        return;
      }

      const isStaff = ['admin', 'librarian', 'assistant'].includes(user.role?.toLowerCase() || '');
      
      let response;
      if (isStaff) {
        response = await apiClient.getStaffById(user.id);
      } else {
        response = await apiClient.getMember(user.id);
      }

      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Manage Staff', path: '/admin/staff', icon: '👥' },
    { label: 'Manage Books', path: '/admin/books', icon: '📚' },
    { label: 'Manage Suppliers', path: '/admin/suppliers', icon: '🏢' },
    { label: 'Manage Orders', path: '/admin/purchase-orders', icon: '📋' },
    { label: 'Reports', path: '/admin/reports', icon: '📈' },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: '📝' },
    { label: 'System Config', path: '/admin/config', icon: '⚙️' },
  ];

  const handleSaveProfile = async (formData: any) => {
    try {
      setIsLoading(true);
      console.log('=== Profile Save Debug ===');
      console.log('User role:', user?.role);
      console.log('Form data:', formData);
      
      // Call API to update profile with the current user's ID
      if (user?.id) {
        // Determine if user is staff or member based on role
        const isStaff = ['admin', 'librarian', 'assistant'].includes(user.role?.toLowerCase() || '');
        
        let response;
        if (isStaff) {
          console.log(`Updating staff with ID: ${user.id}`);
          response = await apiClient.updateStaff(user.id, formData);
        } else {
          console.log(`Updating member with ID: ${user.id}`);
          response = await apiClient.updateMember(user.id, formData);
        }

        // Update local profile data with response
        setProfileData(response.data);

        // Also update the auth store user object to keep it in sync
        setUser({
          ...user,
          fullName: formData.fullName || user.fullName,
          email: formData.email || user.email,
          phoneNumber: formData.phoneNumber || user.phoneNumber,
          address: formData.address || user.address,
          dateOfBirth: formData.dateOfBirth || user.dateOfBirth,
          gender: formData.gender || user.gender,
          linkedIn: formData.linkedIn || user.linkedIn,
          facebook: formData.facebook || user.facebook,
        });

        alert('Profile saved successfully!');
      } else {
        const errorMsg = `User ID is missing or invalid`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save profile: ${errorMessage}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="flex">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-6 md:ml-64">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">Admin Profile</h1>
            {isLoading ? (
              <div className="text-center py-8">Loading profile...</div>
            ) : (
              <ProfileForm onSave={handleSaveProfile} isLoading={isLoading} initialData={profileData} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
