import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';
import Input from '@/components/Input';

interface Staff {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'librarian' | 'assistant';
  status: 'active' | 'inactive';
  joinDate: string;
}

export default function ManageStaff() {
  const [staff, setStaff] = useState<Staff[]>([
    {
      id: '1',
      email: 'duchm@library.com',
      name: 'Đặng Uyên Chi',
      role: 'admin',
      status: 'active',
      joinDate: '2023-01-15',
    },
    {
      id: '2',
      email: 'minhtv@library.com',
      name: 'Trương Văn Minh',
      role: 'librarian',
      status: 'active',
      joinDate: '2023-06-20',
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    email: '',
    name: '',
    role: 'librarian' as const,
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

  const filteredStaff = staff.filter(
    s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStaff = () => {
    if (newStaff.email && newStaff.name) {
      setStaff([
        ...staff,
        {
          id: Date.now().toString(),
          email: newStaff.email,
          name: newStaff.name,
          role: newStaff.role,
          status: 'active',
          joinDate: new Date().toISOString().split('T')[0],
        },
      ]);
      setNewStaff({ email: '', name: '', role: 'librarian' });
      setIsAddingStaff(false);
    }
  };

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="md:ml-64 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-h2 text-neutral-900">Manage Staff</h1>
              <Button
                onClick={() => setIsAddingStaff(!isAddingStaff)}
                variant="primary"
              >
                {isAddingStaff ? 'Cancel' : '+ Add Staff'}
              </Button>
            </div>

            {isAddingStaff && (
              <div className="card mb-6 p-6">
                <h3 className="text-h5 text-neutral-900 mb-4">Add New Staff Member</h3>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    placeholder="Enter staff name"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                  <div>
                    <label className="text-p5 font-semibold text-neutral-700">Role</label>
                    <select
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg mt-1"
                    >
                      <option value="librarian">Librarian</option>
                      <option value="assistant">Assistant</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <Button onClick={handleAddStaff} variant="primary">
                    Create Staff Member
                  </Button>
                </div>
              </div>
            )}

            <div className="card mb-6">
              <Input
                label="Search Staff"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
              />
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="px-6 py-4 text-left text-p5 font-semibold text-neutral-900">Name</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold text-neutral-900">Email</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold text-neutral-900">Role</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold text-neutral-900">Status</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold text-neutral-900">Join Date</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-6 py-4 text-p4 text-neutral-900">{member.name}</td>
                      <td className="px-6 py-4 text-p4 text-neutral-600">{member.email}</td>
                      <td className="px-6 py-4 text-p4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-tag-sm font-semibold bg-primary-100 text-primary-700">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-p4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-tag-sm font-semibold ${
                            member.status === 'active'
                              ? 'bg-status-success-bg text-status-success'
                              : 'bg-status-error-bg text-status-error'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-p4 text-neutral-600">
                        {new Date(member.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-p4">
                        <button
                          onClick={() => handleDeleteStaff(member.id)}
                          className="text-status-error hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-p4 text-neutral-600">
              Showing {filteredStaff.length} of {staff.length} staff members
            </div>
          </div>
        </main>
      </div>
  );
}
