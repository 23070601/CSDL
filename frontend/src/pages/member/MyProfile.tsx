import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/utils/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ProfileForm from '@/components/ProfileForm';

export default function MyProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useAuthStore();

  const sidebarItems = [
    { label: 'Dashboard', path: '/member/dashboard', icon: '📊' },
    { label: 'Search Books', path: '/member/books', icon: '🔍' },
    { label: 'My Profile', path: '/member/profile', icon: '👤' },
    { label: 'My Loans', path: '/member/loans', icon: '📖' },
    { label: 'My Reservations', path: '/member/reservations', icon: '📋' },
    { label: 'My Fines', path: '/member/fines', icon: '💳' },
    { label: 'Notifications', path: '/member/notifications', icon: '🔔' },
  ];

  const handleSaveProfile = async (formData: any) => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User not found');
      }

      // Update member profile via API
      const response = await apiClient.updateMember(user.id, {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });

      // Update local auth state with new data
      setUser({
        ...user,
        fullName: response.data.FullName || formData.fullName,
        email: response.data.Email || formData.email,
      } as any);

      console.log('Profile saved successfully:', response.data);
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="p-6 md:ml-64">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-h2 text-neutral-900 mb-8">My Profile</h1>
          <ProfileForm onSave={handleSaveProfile} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
