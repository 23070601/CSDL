import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ProfileForm from '@/components/ProfileForm';

export default function LibrarianProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const isAssistant = location.pathname.startsWith('/assistant');

  const sidebarItems = isAssistant
    ? [
        { label: 'Dashboard', path: '/assistant/dashboard', icon: '📊' },
        { label: 'Manage Circulation', path: '/assistant/circulation', icon: '📚' },
        { label: 'Reservations', path: '/assistant/reservations', icon: '📋' },
        { label: 'My Profile', path: '/assistant/profile', icon: '👤' },
      ]
    : [
        { label: 'Dashboard', path: '/librarian/dashboard', icon: '📊' },
        { label: 'Manage Circulation', path: '/librarian/circulation', icon: '📚' },
        { label: 'Manage Members', path: '/librarian/members', icon: '👥' },
        { label: 'Reservations', path: '/librarian/reservations', icon: '📋' },
        { label: 'Manage Fines', path: '/librarian/fines', icon: '💰' },
        { label: 'Reports', path: '/librarian/reports', icon: '📈' },
        { label: 'My Profile', path: '/librarian/profile', icon: '👤' },
      ];

  const handleSaveProfile = async (formData: any) => {
    setIsLoading(true);
    try {
      // TODO: Call API to update profile
      // await apiClient.updateProfile(formData);
      console.log('Saving librarian profile:', formData);
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
      <div className="flex">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-6 md:ml-64">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">
              {isAssistant ? 'Assistant Profile' : 'Librarian Profile'}
            </h1>
            <ProfileForm onSave={handleSaveProfile} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
