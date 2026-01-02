import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ProfileForm from '@/components/ProfileForm';
import { apiClient } from '@/utils/api';
import { useAuthStore } from '@/store/authStore';

export default function AdminProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

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
    setIsLoading(true);
    try {
      // Log user info for debugging
      console.log('=== Profile Save Debug ===');
      console.log('Full user object:', JSON.stringify(user, null, 2));
      console.log('User ID:', user?.id);
      console.log('User ID type:', typeof user?.id);
      console.log('Form data:', formData);
      
      // Call API to update profile with the current user's ID
      if (user?.id) {
        const updateUrl = `/members/${user.id}`;
        console.log(`Making PUT request to: ${updateUrl}`);
        await apiClient.updateMember(user.id, formData);
        alert('Profile saved successfully!');
      } else {
        const errorMsg = `User ID is missing or invalid. User object: ${JSON.stringify(user)}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save profile: ${errorMessage}\n\nMake sure the backend server is running and has been restarted to load the latest changes.`);
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
            <ProfileForm onSave={handleSaveProfile} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
