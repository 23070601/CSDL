import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/utils/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

interface Loan {
  LoanID: string;
  bookTitle: string;
  ISBN: string;
  LoanDate: string;
  DueDate: string;
  ReturnDate: string | null;
  Status: string;
  MemberID: string;
}

export default function MyLoans() {
  const { user } = useAuthStore();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('all');

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
      fetchLoans();
    }
  }, [user?.id]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getLoans();
      const memberLoans = (response.data || []).filter((loan: any) => loan.MemberID === user?.id);
      setLoans(memberLoans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate: string, returnDate: string | null) => {
    if (returnDate) return false;
    return new Date(dueDate) < new Date();
  };

  const daysOverdue = (dueDate: string, returnDate: string | null) => {
    if (returnDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    if (today <= due) return 0;
    return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  };

  const filteredLoans = loans.filter(loan => {
    switch (filter) {
      case 'active':
        return !loan.ReturnDate && !isOverdue(loan.DueDate, loan.ReturnDate);
      case 'returned':
        return !!loan.ReturnDate;
      case 'overdue':
        return !loan.ReturnDate && isOverdue(loan.DueDate, loan.ReturnDate);
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="p-6 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-h2 text-neutral-900 mb-8">My Loans</h1>

          {/* Filter Buttons */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {(['all', 'active', 'returned', 'overdue'] as const).map(f => (
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
              <p className="text-p4 text-neutral-600">Loading your loans...</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-p4 text-neutral-600">You have no {filter === 'all' ? 'loans' : filter} loans at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLoans.map(loan => (
                <div key={loan.LoanID} className="card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-h5 text-neutral-900 mb-2">{loan.bookTitle}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-neutral-500 font-semibold">ISBN:</span>
                          <p className="text-neutral-900">{loan.ISBN}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 font-semibold">Loan Date:</span>
                          <p className="text-neutral-900">{new Date(loan.LoanDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 font-semibold">Due Date:</span>
                          <p className={isOverdue(loan.DueDate, loan.ReturnDate) ? 'text-status-error font-semibold' : 'text-neutral-900'}>
                            {new Date(loan.DueDate).toLocaleDateString()}
                          </p>
                        </div>
                        {loan.ReturnDate && (
                          <div>
                            <span className="text-neutral-500 font-semibold">Returned:</span>
                            <p className="text-neutral-900">{new Date(loan.ReturnDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-tag-sm font-semibold ${
                        loan.ReturnDate
                          ? 'bg-status-success-bg text-status-success'
                          : isOverdue(loan.DueDate, loan.ReturnDate)
                          ? 'bg-status-error-bg text-status-error'
                          : 'bg-status-warning-bg text-status-warning'
                      }`}>
                        {loan.ReturnDate ? 'Returned' : isOverdue(loan.DueDate, loan.ReturnDate) ? 'Overdue' : 'Active'}
                      </span>
                      {isOverdue(loan.DueDate, loan.ReturnDate) && (
                        <span className="text-status-error text-tag-sm font-semibold">
                          {daysOverdue(loan.DueDate, loan.ReturnDate)} days overdue
                        </span>
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
