import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { apiClient } from '@/utils/api';

interface Config {
  libraryName?: string;
  maxBorrowDays?: number;
  maxBooksPerMember?: number;
  finePerDay?: number;
  email?: string;
  phone?: string;
  loanPeriodDays?: number;
  maxRenewals?: number;
  holdHours?: number;
  maxActiveLoans?: number;
  [key: string]: any;
}

export default function SystemConfig() {
  const [config, setConfig] = useState<Config>({
    libraryName: 'City Public Library',
    maxBorrowDays: 14,
    maxBooksPerMember: 5,
    finePerDay: 1.5,
    email: 'info@library.com',
    phone: '(555) 123-4567',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getConfig();
      if (response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
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

  const handleChange = (key: keyof Config, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.updateConfig(config);
      setIsEditing(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="md:ml-64 p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">System Configuration</h1>
            
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-h3 text-neutral-900">Library Settings</h2>
                <Button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  variant={isEditing ? 'primary' : 'secondary'}
                >
                  {isEditing ? 'Save Changes' : 'Edit Settings'}
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-p5 font-semibold text-neutral-900 mb-2">Library Name</label>
                  {isEditing ? (
                    <Input
                      value={config.libraryName}
                      onChange={(e) => handleChange('libraryName', e.target.value)}
                      placeholder="Library name"
                    />
                  ) : (
                    <p className="text-p4 text-neutral-700">{config.libraryName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-p5 font-semibold text-neutral-900 mb-2">Maximum Borrow Days</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={config.maxBorrowDays}
                      onChange={(e) => handleChange('maxBorrowDays', parseInt(e.target.value))}
                      placeholder="Days"
                    />
                  ) : (
                    <p className="text-p4 text-neutral-700">{config.maxBorrowDays} days</p>
                  )}
                </div>

                <div>
                  <label className="block text-p5 font-semibold text-neutral-900 mb-2">Maximum Books Per Member</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={config.maxBooksPerMember}
                      onChange={(e) => handleChange('maxBooksPerMember', parseInt(e.target.value))}
                      placeholder="Books"
                    />
                  ) : (
                    <p className="text-p4 text-neutral-700">{config.maxBooksPerMember} books</p>
                  )}
                </div>

                <div>
                  <label className="block text-p5 font-semibold text-neutral-900 mb-2">Fine Per Day</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={config.finePerDay}
                      onChange={(e) => handleChange('finePerDay', parseFloat(e.target.value))}
                      placeholder="Fine amount"
                    />
                  ) : (
                    <p className="text-p4 text-neutral-700">${config.finePerDay}</p>
                  )}
                </div>

                <div>
                  <label className="block text-p5 font-semibold text-neutral-900 mb-2">Contact Email</label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={config.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Email"
                    />
                  ) : (
                    <p className="text-p4 text-neutral-700">{config.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-p5 font-semibold text-neutral-900 mb-2">Contact Phone</label>
                  {isEditing ? (
                    <Input
                      value={config.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="Phone"
                    />
                  ) : (
                    <p className="text-p4 text-neutral-700">{config.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-p5 font-semibold text-neutral-900 mb-2">Loan Period (Days)</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={config.loanPeriodDays || 14}
                      onChange={(e) => handleChange('loanPeriodDays', parseInt(e.target.value))}
                      placeholder="Days"
                    />
                  ) : (
                    <p className="text-p4 text-neutral-700">{config.loanPeriodDays || 14} days</p>
                  )}
                </div>

                <div>
                  <label className="block text-p5 font-semibold text-neutral-900 mb-2">Maximum Renewals</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={config.maxRenewals || 2}
                      onChange={(e) => handleChange('maxRenewals', parseInt(e.target.value))}
                      placeholder="Renewals"
                    />
                  ) : (
                    <p className="text-p4 text-neutral-700">{config.maxRenewals || 2} times</p>
                  )}
                </div>

                <div>
                  <label className="block text-p5 font-semibold text-neutral-900 mb-2">Hold Period (Hours)</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={config.holdHours || 48}
                      onChange={(e) => handleChange('holdHours', parseInt(e.target.value))}
                      placeholder="Hours"
                    />
                  ) : (
                    <p className="text-p4 text-neutral-700">{config.holdHours || 48} hours</p>
                  )}
                </div>

                <div>
                  <label className="block text-p5 font-semibold text-neutral-900 mb-2">Maximum Active Loans</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={config.maxActiveLoans || 5}
                      onChange={(e) => handleChange('maxActiveLoans', parseInt(e.target.value))}
                      placeholder="Loans"
                    />
                  ) : (
                    <p className="text-p4 text-neutral-700">{config.maxActiveLoans || 5} loans</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
