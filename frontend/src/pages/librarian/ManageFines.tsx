import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { apiClient } from '@/utils/api';

interface Fine {
  PaymentID?: string;
  LoanID?: string;
  MemberID?: string;
  MemberName?: string;
  BookTitle?: string;
  Amount?: number;
  Status?: string;
  PaymentDate?: string;
  Method?: string;
}

export default function ManageFines() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [payingFine, setPayingFine] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFine, setNewFine] = useState({
    loanId: '',
    memberId: '',
    amount: '',
    reason: ''
  });

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

    const handleCreateFine = async () => {
      if (!newFine.memberId || !newFine.amount) {
        alert('Member ID and Amount are required');
        return;
      }

      try {
        await apiClient.createFine({
          loanId: newFine.loanId || null,
          memberId: newFine.memberId,
          amount: parseFloat(newFine.amount),
          reason: newFine.reason || 'Manual fine'
        });
        alert('Fine created successfully!');
        setShowAddModal(false);
        setNewFine({ loanId: '', memberId: '', amount: '', reason: '' });
        await fetchFines();
      } catch (error: any) {
        console.error('Error creating fine:', error);
        alert(error.response?.data?.message || 'Failed to create fine');
      }
    };

  const filteredFines = fines.filter(f => {
    const matchesSearch = 
      (f.MemberName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.BookTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.PaymentID || '').toString().includes(searchTerm);
    
    if (!matchesSearch) return false;

    const status = (f.Status || '').toLowerCase();
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

  // Compute totals using all fines (not just the filtered view) so summary cards remain accurate
  const totalUnpaid = fines
    .filter(f => f.Status?.toLowerCase() === 'unpaid')
    .reduce((sum, f) => sum + Number(f.Amount || 0), 0);

  const totalPaid = fines
    .filter(f => f.Status?.toLowerCase() === 'paid')
    .reduce((sum, f) => sum + Number(f.Amount || 0), 0);

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
            
              <div className="mb-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                >
                  + Add New Fine
                </button>
              </div>

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
                        <tr key={fine.PaymentID} className="border-b border-neutral-200 hover:bg-neutral-50">
                          <td className="py-3 px-4">{fine.PaymentID}</td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{fine.MemberName || 'Unknown'}</div>
                              <div className="text-sm text-neutral-500">{fine.MemberID}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{fine.BookTitle || 'Unknown'}</td>
                          <td className="py-3 px-4 font-semibold">${parseFloat((fine.Amount || 0).toString()).toFixed(2)}</td>
                          <td className="py-3 px-4">
                            {new Date(fine.PaymentDate || '').toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              fine.Status?.toLowerCase() === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {fine.Status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {fine.Status?.toLowerCase() === 'unpaid' && (
                              payingFine === fine.PaymentID ? (
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
                                    onClick={() => handlePayFine(fine.PaymentID || '', parseFloat(paymentAmount))}
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
                                    setPayingFine(fine.PaymentID || '');
                                    setPaymentAmount((fine.Amount || 0).toString());
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

              {/* Add Fine Modal */}
              {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h2 className="text-xl font-bold text-neutral-900 mb-4">Create New Fine</h2>
                  
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Member ID *
                        </label>
                        <input
                          type="text"
                          value={newFine.memberId}
                          onChange={(e) => setNewFine({ ...newFine, memberId: e.target.value })}
                          placeholder="Enter member ID (e.g., M001)"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Loan ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={newFine.loanId}
                          onChange={(e) => setNewFine({ ...newFine, loanId: e.target.value })}
                          placeholder="Enter loan ID if applicable"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Amount * ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newFine.amount}
                          onChange={(e) => setNewFine({ ...newFine, amount: e.target.value })}
                          placeholder="0.00"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Reason
                        </label>
                        <input
                          type="text"
                          value={newFine.reason}
                          onChange={(e) => setNewFine({ ...newFine, reason: e.target.value })}
                          placeholder="e.g., Lost book, Damaged book, Late return"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleCreateFine}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                      >
                        Create Fine
                      </button>
                      <button
                        onClick={() => {
                          setShowAddModal(false);
                          setNewFine({ loanId: '', memberId: '', amount: '', reason: '' });
                        }}
                        className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}
