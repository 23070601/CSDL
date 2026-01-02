import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function AdminProfile() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // TODO: Implement API call to update profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="flex">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-6 md:ml-64">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">Admin Profile</h1>

            <div className="card">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-h3">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-h4 text-neutral-900">{user.fullName}</h2>
                  <p className="text-p4 text-neutral-600">{user.email}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-tag-sm font-semibold bg-primary-100 text-primary-700">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-6">
                {!isEditing ? (
                  <>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="text-p5 font-semibold text-neutral-700">Full Name</label>
                        <p className="text-p4 text-neutral-900 mt-1">{user.fullName}</p>
                      </div>
                      <div>
                        <label className="text-p5 font-semibold text-neutral-700">Email</label>
                        <p className="text-p4 text-neutral-900 mt-1">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-p5 font-semibold text-neutral-700">Role</label>
                        <p className="text-p4 text-neutral-900 mt-1">{user.role}</p>
                      </div>
                      <div>
                        <label className="text-p5 font-semibold text-neutral-700">Status</label>
                        <p className="text-p4 text-neutral-900 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-p5 font-semibold ${
                            user.status === 'active' 
                              ? 'bg-status-success-bg text-status-success'
                              : 'bg-status-error-bg text-status-error'
                          }`}>
                            {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="primary"
                    >
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
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
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleSave}
                        variant="primary"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="card mt-6">
              <h3 className="text-h5 text-neutral-900 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-p4 text-neutral-600">Member ID</span>
                  <span className="text-p4 font-semibold text-neutral-900">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-p4 text-neutral-600">Account Created</span>
                  <span className="text-p4 font-semibold text-neutral-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
