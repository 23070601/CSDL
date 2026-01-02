import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { apiClient } from '@/utils/api';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LibrarianReports() {
  const [loans, setLoans] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'circulation' | 'members' | 'fines'>('circulation');

  const sidebarItems = [
    { label: 'Dashboard', path: '/librarian/dashboard', icon: '📊' },
    { label: 'Manage Circulation', path: '/librarian/circulation', icon: '📖' },
    { label: 'Manage Reservations', path: '/librarian/reservations', icon: '📋' },
    { label: 'Manage Members', path: '/librarian/members', icon: '👥' },
    { label: 'Manage Fines', path: '/librarian/fines', icon: '💳' },
    { label: 'Reports', path: '/librarian/reports', icon: '📈' },
  ];

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [loansRes, booksRes, membersRes, finesRes] = await Promise.all([
        apiClient.getLoans(),
        apiClient.getBooks(),
        apiClient.getMembers(),
        apiClient.getFines(),
      ]);
      setLoans(loansRes.data || []);
      setBooks(booksRes.data || []);
      setMembers(membersRes.data || []);
      setFines(finesRes.data || []);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Circulation stats
  const activeLoans = loans.filter(l => (l.Status || l.status)?.toLowerCase() === 'borrowed').length;
  const returnedLoans = loans.filter(l => (l.Status || l.status)?.toLowerCase() === 'returned').length;
  const overdueLoans = loans.filter(l => {
    const status = (l.Status || l.status || '').toLowerCase();
    const dueDate = l.DueDate || l.dueDate;
    return status === 'borrowed' && dueDate && new Date(dueDate) < new Date();
  }).length;

  // Loans by status chart
  const loansByStatus = [
    { name: 'Active', value: activeLoans, color: '#3B82F6' },
    { name: 'Returned', value: returnedLoans, color: '#10B981' },
    { name: 'Overdue', value: overdueLoans, color: '#EF4444' },
  ].filter(item => item.value > 0);

  // Member stats
  const activeMembers = members.filter(m => (m.Status || m.status)?.toLowerCase() === 'active').length;
  const inactiveMembers = members.filter(m => (m.Status || m.status)?.toLowerCase() === 'inactive').length;

  // Members by type chart
  const memberTypeMap: any = {};
  members.forEach((m: any) => {
    const type = m.MemberType || m.memberType || 'Standard';
    memberTypeMap[type] = (memberTypeMap[type] || 0) + 1;
  });
  const membersByType = Object.keys(memberTypeMap).map(type => ({
    name: type,
    value: memberTypeMap[type],
  }));

  // Fine stats
  const unpaidFines = fines.filter(f => (f.Status || f.status)?.toLowerCase() === 'unpaid');
  const paidFines = fines.filter(f => (f.Status || f.status)?.toLowerCase() === 'paid');
  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + parseFloat((f.Amount || f.amount || 0).toString()), 0);
  const totalPaid = paidFines.reduce((sum, f) => sum + parseFloat((f.Amount || f.amount || 0).toString()), 0);

  // Fines by status chart
  const finesByStatus = [
    { name: 'Unpaid', value: totalUnpaid, color: '#EF4444' },
    { name: 'Paid', value: totalPaid, color: '#10B981' },
  ].filter(item => item.value > 0);

  // Most borrowed books
  const bookLoanCount: any = {};
  loans.forEach((l: any) => {
    const bookId = l.BookID || l.bookID;
    const bookTitle = l.BookTitle || l.bookTitle;
    if (bookId && bookTitle) {
      if (!bookLoanCount[bookId]) {
        bookLoanCount[bookId] = { title: bookTitle, count: 0 };
      }
      bookLoanCount[bookId].count++;
    }
  });
  const topBooks = Object.values(bookLoanCount)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5)
    .map((item: any) => ({
      name: item.title.length > 30 ? item.title.substring(0, 30) + '...' : item.title,
      loans: item.count,
    }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="flex">
          <Sidebar items={sidebarItems} />
          <main className="flex-1 p-6 md:ml-64">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-neutral-600">Loading reports...</p>
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
            <h1 className="text-h2 text-neutral-900 mb-8">Reports</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setActiveTab('circulation')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === 'circulation'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                📖 Circulation Report
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === 'members'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                👥 Member Report
              </button>
              <button
                onClick={() => setActiveTab('fines')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === 'fines'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                💳 Financial Report
              </button>
            </div>

            {/* Circulation Report */}
            {activeTab === 'circulation' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card bg-blue-50">
                    <p className="text-sm text-blue-600 font-semibold mb-2">Active Loans</p>
                    <p className="text-3xl font-bold text-blue-700">{activeLoans}</p>
                  </div>
                  <div className="card bg-green-50">
                    <p className="text-sm text-green-600 font-semibold mb-2">Returned</p>
                    <p className="text-3xl font-bold text-green-700">{returnedLoans}</p>
                  </div>
                  <div className="card bg-red-50">
                    <p className="text-sm text-red-600 font-semibold mb-2">Overdue</p>
                    <p className="text-3xl font-bold text-red-700">{overdueLoans}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <h2 className="text-h5 text-neutral-900 mb-6">Loans by Status</h2>
                    {loansByStatus.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={loansByStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {loansByStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-neutral-500 py-12">No loan data available</p>
                    )}
                  </div>

                  <div className="card">
                    <h2 className="text-h5 text-neutral-900 mb-6">Top 5 Borrowed Books</h2>
                    {topBooks.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topBooks} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={150} />
                          <Tooltip />
                          <Bar dataKey="loans" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-neutral-500 py-12">No book data available</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Member Report */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card bg-purple-50">
                    <p className="text-sm text-purple-600 font-semibold mb-2">Total Members</p>
                    <p className="text-3xl font-bold text-purple-700">{members.length}</p>
                  </div>
                  <div className="card bg-green-50">
                    <p className="text-sm text-green-600 font-semibold mb-2">Active Members</p>
                    <p className="text-3xl font-bold text-green-700">{activeMembers}</p>
                  </div>
                  <div className="card bg-gray-50">
                    <p className="text-sm text-gray-600 font-semibold mb-2">Inactive Members</p>
                    <p className="text-3xl font-bold text-gray-700">{inactiveMembers}</p>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-h5 text-neutral-900 mb-6">Members by Type</h2>
                  {membersByType.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={membersByType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8B5CF6" name="Members" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-neutral-500 py-12">No member data available</p>
                  )}
                </div>
              </div>
            )}

            {/* Financial Report */}
            {activeTab === 'fines' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card bg-red-50">
                    <p className="text-sm text-red-600 font-semibold mb-2">Unpaid Fines</p>
                    <p className="text-3xl font-bold text-red-700">${totalUnpaid.toFixed(2)}</p>
                    <p className="text-xs text-red-600 mt-1">{unpaidFines.length} fines</p>
                  </div>
                  <div className="card bg-green-50">
                    <p className="text-sm text-green-600 font-semibold mb-2">Paid Fines</p>
                    <p className="text-3xl font-bold text-green-700">${totalPaid.toFixed(2)}</p>
                    <p className="text-xs text-green-600 mt-1">{paidFines.length} fines</p>
                  </div>
                  <div className="card bg-blue-50">
                    <p className="text-sm text-blue-600 font-semibold mb-2">Total Revenue</p>
                    <p className="text-3xl font-bold text-blue-700">${totalPaid.toFixed(2)}</p>
                    <p className="text-xs text-blue-600 mt-1">From fines</p>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-h5 text-neutral-900 mb-6">Fines by Status</h2>
                  {finesByStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={finesByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {finesByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-neutral-500 py-12">No fine data available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
