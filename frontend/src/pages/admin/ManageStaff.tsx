import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { apiClient } from '@/utils/api';

interface Staff {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'librarian' | 'assistant';
  status: 'active' | 'inactive';
  joinDate: string;
}

export default function ManageStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'librarian' | 'assistant'>('all');
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [newStaff, setNewStaff] = useState({
    email: '',
    name: '',
    role: 'librarian' as const,
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getStaff();
      // Map backend response format to interface
      const mappedStaff = (response.data || []).map((item: any) => ({
        id: item.StaffID || item.id || '',
        email: item.Email || item.email || '',
        name: item.FullName || item.name || '',
        role: item.Role || item.role || 'librarian',
        status: (item.ActiveFlag === 1 || item.ActiveFlag === true ? 'active' : 'inactive') as 'active' | 'inactive',
        joinDate: item.joinDate || new Date().toISOString().split('T')[0],
      }));
      setStaff(mappedStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
    } finally {
      setLoading(false);
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

  const filteredStaff = staff.filter(
    s =>
      (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) && 
      (statusFilter === 'all' || s.status === statusFilter) &&
      (roleFilter === 'all' || s.role === roleFilter)
  );

  const handleAddStaff = async () => {
    if (newStaff.email && newStaff.name) {
      try {
        const defaultPassword = 'Password123!';
        // Create staff member via API
        const response = await apiClient.createStaff({
          email: newStaff.email,
          fullName: newStaff.name,
          role: newStaff.role,
          status: 'active',
        });
        
        // Add to local state with API response, mapping backend format to interface
        const newStaffMember = {
          id: response.data.id || response.data.StaffID || '',
          email: response.data.email || response.data.Email || '',
          name: response.data.name || response.data.FullName || '',
          role: response.data.role || response.data.Role || newStaff.role,
          status: (response.data.status === 'active' || response.data.ActiveFlag === 1 || response.data.ActiveFlag === true ? 'active' : 'inactive') as 'active' | 'inactive',
          joinDate: response.data.joinDate || new Date().toISOString().split('T')[0],
        };
        setStaff([...staff, newStaffMember]);
        setGeneratedPassword(defaultPassword);
        setNewStaff({ email: '', name: '', role: 'librarian' });
        // Don't close form immediately so user can see password
      } catch (error) {
        console.error('Error creating staff:', error);
        alert('Failed to create staff member. Please try again.');
      }
    }
  };

  const handleEditStaff = async () => {
    if (editingStaff && editingStaff.email && editingStaff.name) {
      try {
        await apiClient.updateStaff(editingStaff.id, {
          fullName: editingStaff.name,
          email: editingStaff.email,
          role: editingStaff.role,
          status: editingStaff.status,
        });
        
        setStaff(staff.map(s => s.id === editingStaff.id ? editingStaff : s));
        setEditingStaff(null);
        alert('Staff member updated successfully!');
      } catch (error) {
        console.error('Error updating staff:', error);
        alert('Failed to update staff member. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (member: Staff) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    try {
      await apiClient.updateStaff(member.id, {
        fullName: member.name,
        email: member.email,
        role: member.role,
        status: newStatus,
      });
      
      setStaff(staff.map(s => s.id === member.id ? { ...s, status: newStatus as 'active' | 'inactive' } : s));
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }
    
    try {
      await apiClient.deleteStaff(id);
      setStaff(staff.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff member. Please try again.');
    }
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

            {generatedPassword && (
              <div className="card mb-6 p-6 bg-green-50 border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-h5 text-green-900 mb-2">✅ Staff Member Created Successfully!</h3>
                    <p className="text-p4 text-green-800 mb-4">Please save this password - it won't be shown again:</p>
                    <div className="bg-white p-4 rounded border-2 border-green-300 mb-4">
                      <p className="text-p5 text-neutral-600 mb-1">Email: <span className="font-semibold">{staff[staff.length - 1]?.email}</span></p>
                      <p className="text-p5 text-neutral-600 mb-2">Default Password:</p>
                      <p className="text-h5 font-mono text-neutral-900 bg-neutral-100 p-3 rounded">{generatedPassword}</p>
                    </div>
                    <p className="text-p5 text-green-700">The staff member should change this password after first login.</p>
                  </div>
                  <button
                    onClick={() => {
                      setGeneratedPassword('');
                      setIsAddingStaff(false);
                    }}
                    className="text-green-700 hover:text-green-900 font-bold text-xl ml-4"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {editingStaff && (
              <div className="card mb-6 p-6">
                <h3 className="text-h5 text-neutral-900 mb-4">Edit Staff Member</h3>
                <div className="space-y-4">
                  <Input
                    label="Name"
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                    placeholder="Full name"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={editingStaff.email}
                    onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                  <div>
                    <label className="block text-p4 font-semibold text-neutral-900 mb-2">Role</label>
                    <select
                      value={editingStaff.role}
                      onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value as 'admin' | 'librarian' | 'assistant' })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="librarian">Librarian</option>
                      <option value="assistant">Assistant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-p4 font-semibold text-neutral-900 mb-2">Status</label>
                    <select
                      value={editingStaff.status}
                      onChange={(e) => setEditingStaff({ ...editingStaff, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleEditStaff} variant="primary">
                      Save Changes
                    </Button>
                    <Button onClick={() => setEditingStaff(null)} variant="secondary">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isAddingStaff && !generatedPassword && (
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

            <div className="card mb-6 space-y-4">
              <Input
                label="Search Staff"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-p5 font-semibold text-neutral-900 mb-2">Filter by Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-p4"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-p5 font-semibold text-neutral-900 mb-2">Filter by Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'librarian' | 'assistant')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-p4"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="librarian">Librarian</option>
                    <option value="assistant">Assistant</option>
                  </select>
                </div>
              </div>
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
                    <th className="px-6 py-4 text-left text-p5 font-semibold text-neutral-900" style={{width: '200px'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                        Loading staff members...
                      </td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                        No staff members found
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((member) => (
                      <tr key={member.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-6 py-4 text-p4 text-neutral-900">{member.name}</td>
                        <td className="px-6 py-4 text-p4 text-neutral-600">{member.email}</td>
                        <td className="px-6 py-4 text-p4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-tag-sm font-semibold bg-primary-100 text-primary-700">
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-p4">
                          <button
                            onClick={() => handleToggleStatus(member)}
                            className={`inline-flex items-center px-2 py-1 rounded text-tag-sm font-semibold cursor-pointer transition-colors ${
                              member.status === 'active'
                                ? 'bg-status-success-bg text-status-success hover:bg-green-200'
                                : 'bg-status-error-bg text-status-error hover:bg-red-200'
                            }`}
                            title={`Click to change to ${member.status === 'active' ? 'inactive' : 'active'}`}
                          >
                            {member.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-p4 text-neutral-600">
                          {new Date(member.joinDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-p4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingStaff(member)}
                              className="text-primary-600 hover:underline font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(member.id)}
                              className="text-status-error hover:underline font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
