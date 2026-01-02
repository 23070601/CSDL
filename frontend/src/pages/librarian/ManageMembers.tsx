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
  email?: string;
  Email?: string;
  phone?: string;
  Phone?: string;
  memberType?: string;
  MemberType?: string;
  joinDate?: string;
  JoinDate?: string;
  status?: string;
  Status?: string;
}

export default function ManageMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Standard' | 'Premium' | 'Student'>('all');

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
      (m.name || m.Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.email || m.Email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.phone || m.Phone || '').includes(searchTerm);
    
    if (!matchesSearch) return false;

    const status = (m.status || m.Status || '').toLowerCase();
    const type = m.memberType || m.MemberType || 'Standard';

    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesType = typeFilter === 'all' || type === typeFilter;

    return matchesStatus && matchesType;
  });

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
                    { value: 'Standard', label: 'Standard' },
                    { value: 'Premium', label: 'Premium' },
                    { value: 'Student', label: 'Student' },
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-neutral-500">
                          No members found
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member) => (
                        <tr key={member.memberID || member.MemberID} className="border-b border-neutral-200 hover:bg-neutral-50">
                          <td className="py-3 px-4">{member.memberID || member.MemberID}</td>
                          <td className="py-3 px-4">{member.name || member.Name}</td>
                          <td className="py-3 px-4">{member.email || member.Email}</td>
                          <td className="py-3 px-4">{member.phone || member.Phone || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                              {member.memberType || member.MemberType || 'Standard'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(member.joinDate || member.JoinDate || '').toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              (member.status || member.Status)?.toLowerCase() === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status || member.Status}
                            </span>
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
    </div>
  );
}
