import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { apiClient } from '@/utils/api';

interface Fine {
  fineID?: string;
  FineID?: string;
  loanID?: string;
  LoanID?: string;
  memberID?: string;
  MemberID?: string;
  memberName?: string;
  MemberName?: string;
  bookTitle?: string;
  BookTitle?: string;
  amount?: number;
  Amount?: number;
  status?: string;
  Status?: string;
  issueDate?: string;
  IssueDate?: string;
  paidDate?: string;
  PaidDate?: string;
}

export default function ManageFines() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [payingFine, setPayingFine] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const sidebarItems = [
    { label: 'Dashboard', path: '/librarian/dashboard', icon: '📊' },
    { label: 'Manage Circulation', path: '/librarian/circulation', icon: '📖' },
    { label: 'Manage Reservations', path: '/librarian/reservations', icon: '📋' },
    { label: 'Manage Members', path: '/librarian/members', icon: '👥' },
    { label: 'Manage Fines', path: '/librarian/fines', icon: '💳' },
    { label: 'Reports', path: '/librarian/reports', icon: '📈' },
  ];

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getFines();
      setFines(response.data || []);
    } catch (error) {
      console.error('Error fetching fines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFines = fines.filter(f => {
    const matchesSearch = 
      (f.memberName || f.MemberName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.bookTitle || f.BookTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.fineID || f.FineID || '').toString().includes(searchTerm);
    
    if (!matchesSearch) return false;

    const status = (f.status || f.Status || '').toLowerCase();
    if (statusFilter === 'all') return true;
    return status === statusFilter;
  });

  const handlePayFine = async (fineID: string, amount: number) => {
    try {
      await apiClient.payFine(fineID, { amount });
      alert('Fine paid successfully!');
      setPayingFine(null);
      setPaymentAmount('');
      fetchFines();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error paying fine');
    }
  };

  const totalUnpaid = filteredFines
    .filter(f => (f.status || f.Status)?.toLowerCase() === 'unpaid')
    .reduce((sum, f) => sum + parseFloat((f.amount || f.Amount || 0).toString()), 0);

  const totalPaid = filteredFines
    .filter(f => (f.status || f.Status)?.toLowerCase() === 'paid')
    .reduce((sum, f) => sum + parseFloat((f.amount || f.Amount || 0).toString()), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="flex">
          <Sidebar items={sidebarItems} />
          <main className="flex-1 p-6 md:ml-64">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-neutral-600">Loading fines...</p>
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
            <h1 className="text-h2 text-neutral-900 mb-8">Manage Fines</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card bg-gradient-to-br from-red-50 to-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-semibold mb-1">Total Unpaid</p>
                    <p className="text-2xl font-bold text-red-700">${totalUnpaid.toFixed(2)}</p>
                  </div>
                  <div className="text-3xl">💳</div>
                </div>
              </div>
              <div className="card bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-semibold mb-1">Total Paid</p>
                    <p className="text-2xl font-bold text-green-700">${totalPaid.toFixed(2)}</p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-semibold mb-1">Total Fines</p>
                    <p className="text-2xl font-bold text-blue-700">{filteredFines.length}</p>
                  </div>
                  <div className="text-3xl">📋</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Search"
                  placeholder="Search by member, book, or fine ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  label="Filter by Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  options={[
                    { value: 'all', label: 'All Fines' },
                    { value: 'unpaid', label: 'Unpaid' },
                    { value: 'paid', label: 'Paid' },
                  ]}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b-2 border-neutral-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Fine ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Member</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Book</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Issue Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFines.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-neutral-500">
                          No fines found
                        </td>
                      </tr>
                    ) : (
                      filteredFines.map((fine) => (
                        <tr key={fine.fineID || fine.FineID} className="border-b border-neutral-200 hover:bg-neutral-50">
                          <td className="py-3 px-4">{fine.fineID || fine.FineID}</td>
                          <td className="py-3 px-4">{fine.memberName || fine.MemberName || 'Unknown'}</td>
                          <td className="py-3 px-4">{fine.bookTitle || fine.BookTitle || 'Unknown'}</td>
                          <td className="py-3 px-4 font-semibold">${parseFloat((fine.amount || fine.Amount || 0).toString()).toFixed(2)}</td>
                          <td className="py-3 px-4">
                            {new Date(fine.issueDate || fine.IssueDate || '').toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              (fine.status || fine.Status)?.toLowerCase() === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {fine.status || fine.Status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {(fine.status || fine.Status)?.toLowerCase() === 'unpaid' && (
                              payingFine === (fine.fineID || fine.FineID) ? (
                                <div className="flex gap-2 items-center">
                                  <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-24"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handlePayFine(fine.fineID || fine.FineID || '', parseFloat(paymentAmount))}
                                  >
                                    Pay
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                      setPayingFine(null);
                                      setPaymentAmount('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setPayingFine(fine.fineID || fine.FineID || '');
                                    setPaymentAmount((fine.amount || fine.Amount || 0).toString());
                                  }}
                                >
                                  Pay Fine
                                </Button>
                              )
                            )}
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
