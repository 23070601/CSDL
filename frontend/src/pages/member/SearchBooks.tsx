import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { apiClient } from '@/utils/api';

interface Book {
  BookID?: number;
  Title?: string;
  ISBN?: string;
  Publisher?: string;
  PubYear?: number;
  TotalCopies?: number;
  AvailableCopies?: number;
  BorrowedCopies?: number;
  Authors?: string;
}

export default function SearchBooks() {
  const { user } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'year'>('title');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);

  const sidebarItems = [
    { label: 'Dashboard', path: '/member/dashboard', icon: '📊' },
    { label: 'Search Books', path: '/member/books', icon: '📚' },
    { label: 'My Profile', path: '/member/profile', icon: '👤' },
    { label: 'My Loans', path: '/member/loans', icon: '📖' },
    { label: 'My Reservations', path: '/member/reservations', icon: '📋' },
    { label: 'My Fines', path: '/member/fines', icon: '💳' },
    { label: 'Notifications', path: '/member/notifications', icon: '🔔' },
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBooks();
      setBooks(response.data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedBooks = books
    .filter(book => {
      const matchesSearch =
        (book.Title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.Authors || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.ISBN || '').includes(searchTerm);

      const matchesAvailable = !filterAvailable || (book.AvailableCopies || 0) > 0;

      return matchesSearch && matchesAvailable;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'author':
          return (a.Authors || '').localeCompare(b.Authors || '');
        case 'year':
          return (b.PubYear || 0) - (a.PubYear || 0);
        case 'title':
        default:
          return (a.Title || '').localeCompare(b.Title || '');
      }
    });

  const handleReserve = (book: Book) => {
    setSelectedBook(book);
    setShowReservationModal(true);
  };

  const handleConfirmReservation = async () => {
    if (!selectedBook || !user) {
      alert('Unable to create reservation. Please try again.');
      return;
    }

    try {
      setReservationLoading(true);
      await apiClient.createReservation({
        memberId: user.id,
        bookId: selectedBook.BookID,
      });

      alert(`${(selectedBook.AvailableCopies || 0) > 0 ? 'Reservation' : 'Waiting list registration'} confirmed!`);
      setShowReservationModal(false);
      setSelectedBook(null);
      
      // Refresh books to update available copies
      await fetchBooks();
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Failed to create reservation. Please try again.');
    } finally {
      setReservationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="p-6 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-h2 text-neutral-900 mb-8">Search Books</h1>

          {/* Search and Filter Controls */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                label="Search by Title, Author, or ISBN"
                placeholder="Enter title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                options={[
                  { value: 'title', label: 'Title (A-Z)' },
                  { value: 'author', label: 'Author (A-Z)' },
                  { value: 'year', label: 'Year (Newest First)' },
                ]}
              />
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterAvailable}
                    onChange={(e) => setFilterAvailable(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-p4 text-neutral-700">Available Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-p4 text-neutral-600">
              Showing <span className="font-semibold text-neutral-900">{filteredAndSortedBooks.length}</span> of <span className="font-semibold text-neutral-900">{books.length}</span> books
            </p>
            <Button onClick={fetchBooks} variant="secondary" size="sm">
              Refresh
            </Button>
          </div>

          {/* Books Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-neutral-600">Loading books...</p>
            </div>
          ) : filteredAndSortedBooks.length === 0 ? (
            <div className="card text-center py-12 bg-blue-50 border border-blue-200">
              <p className="text-p4 text-blue-900">📚 No books found matching your search.</p>
              <p className="text-p5 text-blue-800 mt-2">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedBooks.map((book) => (
                <div key={book.BookID} className="card hover:shadow-lg transition-shadow flex flex-col h-full">
                  {/* Header with Title and Status */}
                  <div className="mb-4 pb-4 border-b border-neutral-200">
                    <h3 className="text-p3 font-bold text-neutral-900 mb-2 line-clamp-2">{book.Title}</h3>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-p5 font-semibold text-neutral-600">
                        {book.ISBN && `ISBN: ${book.ISBN}`}
                      </span>
                      {(book.AvailableCopies || 0) > 0 ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                          ✓ Available
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Book Details */}
                  <div className="space-y-3 mb-4 flex-1">
                    {book.Authors && (
                      <div>
                        <p className="text-p6 text-neutral-500 font-semibold">Author</p>
                        <p className="text-p5 text-neutral-800">{book.Authors}</p>
                      </div>
                    )}
                    {book.Publisher && (
                      <div>
                        <p className="text-p6 text-neutral-500 font-semibold">Publisher</p>
                        <p className="text-p5 text-neutral-800">{book.Publisher}</p>
                      </div>
                    )}
                    {book.PubYear && (
                      <div>
                        <p className="text-p6 text-neutral-500 font-semibold">Published</p>
                        <p className="text-p5 text-neutral-800">{book.PubYear}</p>
                      </div>
                    )}
                  </div>

                  {/* Copy Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-neutral-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary-600">{book.TotalCopies || 0}</p>
                      <p className="text-xs text-neutral-600 font-semibold">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{book.AvailableCopies || 0}</p>
                      <p className="text-xs text-neutral-600 font-semibold">Available</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-600">{book.BorrowedCopies || 0}</p>
                      <p className="text-xs text-neutral-600 font-semibold">Borrowed</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-neutral-200">
                    {(book.AvailableCopies || 0) > 0 ? (
                      <button
                        onClick={() => handleReserve(book)}
                        className="w-full px-4 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors text-p5 shadow-sm"
                      >
                        📌 Reserve Book
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReserve(book)}
                        className="w-full px-4 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors text-p5 shadow-sm"
                      >
                        ⏳ Join Waiting List
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reservation Modal */}
          {showReservationModal && selectedBook && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">
                  {(selectedBook.AvailableCopies || 0) > 0 ? 'Reserve' : 'Join Waiting List for'} Book
                </h2>
                <div className="bg-neutral-50 p-4 rounded-lg mb-6 space-y-2">
                  <p className="text-p4">
                    <span className="font-semibold">Title:</span> {selectedBook.Title}
                  </p>
                  {selectedBook.Authors && (
                    <p className="text-p4">
                      <span className="font-semibold">Author:</span> {selectedBook.Authors}
                    </p>
                  )}
                  {(selectedBook.AvailableCopies || 0) > 0 && (
                    <p className="text-p4 text-green-700 font-semibold">
                      ✓ {selectedBook.AvailableCopies} copy available
                    </p>
                  )}
                  {(selectedBook.AvailableCopies || 0) === 0 && (
                    <p className="text-p4 text-orange-700 font-semibold">
                      ⏳ Currently unavailable - join waiting list
                    </p>
                  )}
                </div>
                <p className="text-p5 text-neutral-600 mb-6">
                  {(selectedBook.AvailableCopies || 0) > 0
                    ? 'A copy will be reserved for you for 7 days. You can pick it up at the library circulation desk.'
                    : 'You will be added to the waiting list. We will notify you when a copy becomes available.'}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleConfirmReservation}
                    className="flex-1"
                    isLoading={reservationLoading}
                  >
                    Confirm
                  </Button>
                  <Button
                    onClick={() => setShowReservationModal(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
