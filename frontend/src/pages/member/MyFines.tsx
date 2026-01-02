import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/utils/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';
import Input from '@/components/Input';

interface Fine {
  FineID: string;
  BookTitle: string;
  LoanID: string;
  FineAmount: number;
  FineDate: string;
  PaidDate: string | null;
  Status: string;
}

export default function MyFines() {
  const { user } = useAuthStore();
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [payingFineId, setPayingFineId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const sidebarItems = [
    { label: 'Dashboard', path: '/member/dashboard', icon: '📊' },
    { label: 'Search Books', path: '/member/books', icon: '🔍' },
    { label: 'My Profile', path: '/member/profile', icon: '👤' },
    { label: 'My Loans', path: '/member/loans', icon: '📖' },
    { label: 'My Reservations', path: '/member/reservations', icon: '📋' },
    { label: 'My Fines', path: '/member/fines', icon: '💳' },
    { label: 'Notifications', path: '/member/notifications', icon: '🔔' },
  ];

  useEffect(() => {
    if (user?.id) {
      fetchFines();
    }
  }, [user?.id]);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getFines();
      const memberFines = (response.data || []).filter((f: any) => f.MemberID === user?.id);
      setFines(memberFines);
    } catch (error) {
      console.error('Error fetching fines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (fineId: string) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    try {
      setPaymentLoading(true);
      await apiClient.payFine(fineId, {
        amountPaid: parseFloat(paymentAmount),
        paymentDate: new Date().toISOString().split('T')[0],
      });
      
      // Refresh fines list
      await fetchFines();
      setPayingFineId(null);
      setPaymentAmount('');
      alert('Payment successful!');
    } catch (error) {
      console.error('Error paying fine:', error);
      alert('Failed to process payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const filteredFines = fines.filter(f => {
    if (filter === 'all') return true;
    if (filter === 'unpaid') return !f.PaidDate;
    if (filter === 'paid') return !!f.PaidDate;
    return true;
  });

  const totalUnpaid = fines
    .filter(f => !f.PaidDate)
    .reduce((sum, f) => sum + f.FineAmount, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="p-6 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-h2 text-neutral-900">My Fines</h1>
            {totalUnpaid > 0 && (
              <div className="text-right">
                <p className="text-p5 text-neutral-600">Total Unpaid</p>
                <p className="text-h4 text-status-error font-bold">${totalUnpaid.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {(['all', 'unpaid', 'paid'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-700 border-2 border-neutral-200 hover:border-primary-600'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="card text-center py-8">
              <p className="text-p4 text-neutral-600">Loading your fines...</p>
            </div>
          ) : filteredFines.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-p4 text-neutral-600">
                {filter === 'all'
                  ? 'You have no fines.'
                  : filter === 'unpaid'
                  ? 'You have no unpaid fines.'
                  : 'You have no paid fines.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFines.map(fine => (
                <div key={fine.FineID} className="card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-h5 text-neutral-900 mb-2">{fine.BookTitle}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-neutral-500 font-semibold">Fine ID:</span>
                          <p className="text-neutral-900">{fine.FineID}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 font-semibold">Amount:</span>
                          <p className="text-neutral-900 font-semibold">${fine.FineAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 font-semibold">Date:</span>
                          <p className="text-neutral-900">{new Date(fine.FineDate).toLocaleDateString()}</p>
                        </div>
                        {fine.PaidDate && (
                          <div>
                            <span className="text-neutral-500 font-semibold">Paid:</span>
                            <p className="text-neutral-900">{new Date(fine.PaidDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-tag-sm font-semibold ${
                        fine.PaidDate
                          ? 'bg-status-success-bg text-status-success'
                          : 'bg-status-error-bg text-status-error'
                      }`}>
                        {fine.PaidDate ? 'Paid' : 'Unpaid'}
                      </span>
                      {!fine.PaidDate && (
                        payingFineId === fine.FineID ? (
                          <div className="flex gap-2 w-full">
                            <Input
                              type="number"
                              value={paymentAmount}
                              onChange={e => setPaymentAmount(e.target.value)}
                              placeholder="Amount"
                              step="0.01"
                              min="0"
                            />
                            <Button
                              onClick={() => handlePayFine(fine.FineID)}
                              variant="primary"
                              size="sm"
                              isLoading={paymentLoading}
                            >
                              Pay
                            </Button>
                            <Button
                              onClick={() => {
                                setPayingFineId(null);
                                setPaymentAmount('');
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              setPayingFineId(fine.FineID);
                              setPaymentAmount(fine.FineAmount.toString());
                            }}
                            variant="primary"
                            size="sm"
                          >
                            Pay Fine
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
