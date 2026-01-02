import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { apiClient } from '@/utils/api';
import { useAuthStore } from '@/store/authStore';

interface Reservation {
  ReservationID?: string;
  BookID?: number;
  Title?: string;
  MemberID?: string;
  FullName?: string;
  ReserveDate?: string;
  PositionInQueue?: number;
  Status?: string;
}

export default function ManageReservations() {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Fulfilled' | 'Cancelled'>('Active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReservation, setNewReservation] = useState({
    bookId: '',
    memberId: ''
  });

  const basePath = user?.role === 'assistant' ? '/assistant' : '/librarian';
  const sidebarItems = [
    { label: 'Dashboard', path: `${basePath}/dashboard`, icon: '📊' },
    { label: 'Manage Circulation', path: `${basePath}/circulation`, icon: '📖' },
    { label: 'Manage Reservations', path: `${basePath}/reservations`, icon: '📋' },
    ...(user?.role === 'assistant'
      ? []
      : [
          { label: 'Manage Members', path: '/librarian/members', icon: '👥' },
          { label: 'Manage Fines', path: '/librarian/fines', icon: '💳' },
          { label: 'Reports', path: '/librarian/reports', icon: '📈' },
        ]),
  ];

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getReservations();
      setReservations(response.data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async (reservationId: string) => {
    if (!confirm('Fulfill this reservation and create a loan?')) {
      return;
    }

    try {
      await apiClient.fulfillReservation(reservationId);
      alert('Reservation fulfilled successfully!');
      await fetchReservations();
    } catch (error: any) {
      console.error('Error fulfilling reservation:', error);
      alert(error.response?.data?.message || 'Failed to fulfill reservation');
    }
  };

  const handleCancel = async (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      await apiClient.cancelReservation(reservationId);
      await fetchReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Failed to cancel reservation');
    }
  };

    const handleCreateReservation = async () => {
      if (!newReservation.bookId || !newReservation.memberId) {
        alert('Please fill in all required fields');
        return;
      }

      try {
        await apiClient.createReservation({
          bookId: parseInt(newReservation.bookId),
          memberId: newReservation.memberId
        });
        alert('Reservation created successfully!');
        setShowAddModal(false);
        setNewReservation({ bookId: '', memberId: '' });
        await fetchReservations();
      } catch (error: any) {
        console.error('Error creating reservation:', error);
        alert(error.response?.data?.message || 'Failed to create reservation');
      }
    };

  const filteredReservations = reservations.filter(r => {
    const matchesSearch = 
      (r.Title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.FullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.MemberID || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const matchesStatus = statusFilter === 'all' || r.Status === statusFilter;
    return matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="flex">
          <Sidebar items={sidebarItems} />
          <main className="flex-1 p-6 md:ml-64">
            <div className="max-w-6xl mx-auto">
              <p className="text-p4 text-neutral-600">Loading reservations...</p>
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
          <div className="max-w-6xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">Manage Reservations</h1>
            
              <div className="mb-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                >
                  + Add New Reservation
                </button>
              </div>

            <div className="card mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by book title, member name, or ID..."
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Fulfilled">Fulfilled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b-2 border-neutral-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Reservation ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Book Title</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Member</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Reserve Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Queue Position</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-neutral-500">
                          No reservations found
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((reservation) => (
                        <tr key={reservation.ReservationID} className="border-b border-neutral-200 hover:bg-neutral-50">
                          <td className="py-3 px-4">{reservation.ReservationID}</td>
                          <td className="py-3 px-4">{reservation.Title}</td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{reservation.FullName}</div>
                              <div className="text-sm text-neutral-500">{reservation.MemberID}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(reservation.ReserveDate || '').toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              reservation.PositionInQueue === 1
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              #{reservation.PositionInQueue}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              reservation.Status === 'Active'
                                ? 'bg-blue-100 text-blue-800'
                                : reservation.Status === 'Fulfilled'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {reservation.Status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {reservation.Status === 'Active' && reservation.PositionInQueue === 1 && (
                                <button
                                  onClick={() => handleFulfill(reservation.ReservationID!)}
                                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                  title="Fulfill reservation and create loan"
                                >
                                  Fulfill
                                </button>
                              )}
                              {reservation.Status === 'Active' && (
                                <button
                                  onClick={() => handleCancel(reservation.ReservationID!)}
                                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                  title="Cancel reservation"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card bg-blue-50 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">ℹ️ Reservation Management Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Only reservations at position #1 can be fulfilled</li>
                <li>• Fulfilling creates a loan and marks the book as borrowed</li>
                <li>• Cancelling a reservation updates queue positions automatically</li>
                <li>• Active reservations are shown by default</li>
              </ul>
            </div>

              {/* Add Reservation Modal */}
              {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h2 className="text-xl font-bold text-neutral-900 mb-4">Create New Reservation</h2>
                  
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Book ID *
                        </label>
                        <input
                          type="number"
                          value={newReservation.bookId}
                          onChange={(e) => setNewReservation({ ...newReservation, bookId: e.target.value })}
                          placeholder="Enter book ID"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Member ID *
                        </label>
                        <input
                          type="text"
                          value={newReservation.memberId}
                          onChange={(e) => setNewReservation({ ...newReservation, memberId: e.target.value })}
                          placeholder="Enter member ID"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleCreateReservation}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                      >
                        Create Reservation
                      </button>
                      <button
                        onClick={() => {
                          setShowAddModal(false);
                          setNewReservation({ bookId: '', memberId: '' });
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
