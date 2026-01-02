import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { apiClient } from '@/utils/api';

interface Member {
  memberID?: string;
  MemberID?: string;
  name?: string;
  Name?: string;
  fullName?: string;
  FullName?: string;
  email?: string;
  Email?: string;
  phone?: string;
  Phone?: string;
  memberType?: string;
  MemberType?: string;
  joinDate?: string;
  JoinDate?: string;
  CardIssueDate?: string;
  status?: string;
  Status?: string;
}

export default function ManageMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Student' | 'Lecturer'>('all');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const sidebarItems = [
    { label: 'Dashboard', path: '/librarian/dashboard', icon: '📊' },
    { label: 'Manage Circulation', path: '/librarian/circulation', icon: '📖' },
    { label: 'Manage Reservations', path: '/librarian/reservations', icon: '📋' },
    { label: 'Manage Members', path: '/librarian/members', icon: '👥' },
    { label: 'Manage Fines', path: '/librarian/fines', icon: '💳' },
    { label: 'Reports', path: '/librarian/reports', icon: '📈' },
  ];

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMembers();
      setMembers(response.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      (m.name || m.Name || m.fullName || m.FullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.email || m.Email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.phone || m.Phone || '').includes(searchTerm);
    
    if (!matchesSearch) return false;

    const status = (m.status || m.Status || '').toLowerCase();
    const type = m.memberType || m.MemberType || 'Student';

    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesType = typeFilter === 'all' || type === typeFilter;

    return matchesStatus && matchesType;
  });

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setShowEditModal(true);
  };

  const handleToggleStatus = async (member: Member) => {
    try {
      const memberId = member.memberID || member.MemberID;
      const currentStatus = (member.status || member.Status || '').toLowerCase();
      const newStatus = currentStatus === 'active' ? 'Locked' : 'Active';
      
      await apiClient.updateMember(memberId!, { status: newStatus });
      await fetchMembers();
    } catch (error) {
      console.error('Error updating member status:', error);
      alert('Failed to update member status');
    }
  };

  const handleDelete = async (member: Member) => {
    const memberId = member.memberID || member.MemberID;
    const memberName = member.name || member.Name || member.fullName || member.FullName;
    
    if (!confirm(`Are you sure you want to delete member "${memberName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.deleteMember(memberId!);
      await fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member. They may have active loans or reservations.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      const memberId = editingMember.memberID || editingMember.MemberID;
      await apiClient.updateMember(memberId!, editingMember);
      setShowEditModal(false);
      setEditingMember(null);
      await fetchMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update member');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="flex">
          <Sidebar items={sidebarItems} />
          <main className="flex-1 p-6 md:ml-64">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-neutral-600">Loading members...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="flex">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-6 md:ml-64">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">Manage Members</h1>
            
            <div className="card">
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Search"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  label="Filter by Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                />
                <Select
                  label="Filter by Type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'Student', label: 'Student' },
                    { value: 'Lecturer', label: 'Lecturer' },
                  ]}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b-2 border-neutral-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Member ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Join Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-neutral-500">
                          No members found
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member) => (
                        <tr key={member.memberID || member.MemberID} className="border-b border-neutral-200 hover:bg-neutral-50">
                          <td className="py-3 px-4">{member.memberID || member.MemberID}</td>
                          <td className="py-3 px-4">{member.name || member.Name || member.fullName || member.FullName}</td>
                          <td className="py-3 px-4">{member.email || member.Email}</td>
                          <td className="py-3 px-4">{member.phone || member.Phone || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                              {member.memberType || member.MemberType || 'Student'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(member.joinDate || member.JoinDate || member.CardIssueDate || '').toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              (member.status || member.Status)?.toLowerCase() === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {member.status || member.Status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(member)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                title="Edit member"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggleStatus(member)}
                                className={`px-3 py-1 text-sm rounded ${
                                  (member.status || member.Status)?.toLowerCase() === 'active'
                                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                                title={(member.status || member.Status)?.toLowerCase() === 'active' ? 'Block member' : 'Unblock member'}
                              >
                                {(member.status || member.Status)?.toLowerCase() === 'active' ? 'Block' : 'Unblock'}
                              </button>
                              <button
                                onClick={() => handleDelete(member)}
                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                title="Delete member"
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
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Member</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingMember.name || editingMember.Name || editingMember.fullName || editingMember.FullName || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value, Name: e.target.value, fullName: e.target.value, FullName: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingMember.email || editingMember.Email || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value, Email: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editingMember.phone || editingMember.Phone || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value, Phone: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                <select
                  value={editingMember.memberType || editingMember.MemberType || 'Student'}
                  onChange={(e) => setEditingMember({ ...editingMember, memberType: e.target.value, MemberType: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Student">Student</option>
                  <option value="Lecturer">Lecturer</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMember(null);
                  }}
                  className="px-4 py-2 text-neutral-700 bg-neutral-200 rounded hover:bg-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-primary-600 rounded hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
