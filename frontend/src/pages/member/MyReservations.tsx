import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/utils/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';

interface Reservation {
  ReservationID: string;
  BookID: string;
  BookTitle: string;
  ISBN: string;
  ReservationDate: string;
  Status: string;
  MemberID: string;
}

export default function MyReservations() {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'fulfilled' | 'cancelled'>('all');

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
      fetchReservations();
    }
  }, [user?.id]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getReservations();
      const memberReservations = (response.data || []).filter((r: any) => r.MemberID === user?.id);
      setReservations(memberReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await apiClient.cancelReservation(reservationId);
      setReservations(prev => prev.filter(r => r.ReservationID !== reservationId));
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Failed to cancel reservation');
    }
  };

  const filteredReservations = reservations.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.Status.toLowerCase() === 'active';
    return r.Status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="p-6 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-h2 text-neutral-900 mb-8">My Reservations</h1>

          {/* Filter Buttons */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {(['all', 'pending', 'fulfilled', 'cancelled'] as const).map(f => (
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
              <p className="text-p4 text-neutral-600">Loading your reservations...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-p4 text-neutral-600">You have no {filter === 'all' ? 'reservations' : filter} reservations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map(reservation => (
                <div key={reservation.ReservationID} className="card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-h5 text-neutral-900 mb-2">{reservation.BookTitle}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-neutral-500 font-semibold">ISBN:</span>
                          <p className="text-neutral-900">{reservation.ISBN}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 font-semibold">Reserved:</span>
                          <p className="text-neutral-900">{new Date(reservation.ReservationDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 font-semibold">Reservation ID:</span>
                          <p className="text-neutral-900">{reservation.ReservationID}</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-tag-sm font-semibold ${
                        reservation.Status.toLowerCase() === 'active'
                          ? 'bg-status-warning-bg text-status-warning'
                          : reservation.Status.toLowerCase() === 'fulfilled'
                          ? 'bg-status-success-bg text-status-success'
                          : 'bg-status-error-bg text-status-error'
                      }`}>
                        {reservation.Status}
                      </span>
                      {reservation.Status.toLowerCase() === 'active' && (
                        <Button
                          onClick={() => handleCancelReservation(reservation.ReservationID)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
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
