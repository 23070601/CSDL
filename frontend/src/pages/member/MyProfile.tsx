import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ProfileForm from '@/components/ProfileForm';

export default function MyProfile() {
  const [isLoading, setIsLoading] = useState(false);

  const sidebarItems = [
    { label: 'Dashboard', path: '/member/dashboard', icon: '📊' },
    { label: 'Search Books', path: '/member/books', icon: '�' },
    { label: 'My Profile', path: '/member/profile', icon: '👤' },
    { label: 'My Loans', path: '/member/loans', icon: '📖' },
    { label: 'My Reservations', path: '/member/reservations', icon: '📋' },
    { label: 'My Fines', path: '/member/fines', icon: '💳' },
    { label: 'Notifications', path: '/member/notifications', icon: '🔔' },
  ];

  const handleSaveProfile = async (formData: any) => {
    setIsLoading(true);
    try {
      // TODO: Call API to update profile
      // await apiClient.updateProfile(formData);
      console.log('Saving member profile:', formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
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
