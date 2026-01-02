import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { apiClient } from '@/utils/api';

interface Book {
  id?: string;
  bookId?: string;
  title: string;
  author?: string;
  isbn: string;
  category?: string;
  totalCopies?: number;
  availableCopies?: number;
  // Backend fields
  Title?: string;
  BookID?: string;
  ISBN?: string;
  Authors?: string;
  Publisher?: string;
  TotalCopies?: number;
  AvailableCopies?: number;
}

export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    totalCopies: 1,
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  // Generate unique ISBN when adding book form opens
  useEffect(() => {
    if (isAddingBook && !newBook.isbn) {
      generateUniqueISBN();
    }
  }, [isAddingBook]);

  const generateUniqueISBN = () => {
    // Generate ISBN-13 format: 978-[10 random digits]
    const prefix = '978';
    const randomDigits = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    const isbn = `${prefix}${randomDigits}`;
    
    // Check if ISBN already exists
    const isDuplicate = books.some(b => 
      (b.isbn || b.ISBN || '') === isbn
    );
    
    if (isDuplicate) {
      // Recursively generate until unique
      generateUniqueISBN();
    } else {
      setNewBook(prev => ({ ...prev, isbn }));
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBooks();
      setBooks(response.data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Manage Staff', path: '/admin/staff', icon: '👥' },
    { label: 'Manage Books', path: '/admin/books', icon: '📚' },
    { label: 'Manage Suppliers', path: '/admin/suppliers', icon: '🏢' },
    { label: 'Manage Orders', path: '/admin/purchase-orders', icon: '📋' },
    { label: 'Reports', path: '/admin/reports', icon: '📈' },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: '📝' },
    { label: 'System Config', path: '/admin/config', icon: '⚙️' },
  ];

  const filteredBooks = books.filter(
    b =>
      (b.title || b.Title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.isbn || b.ISBN || '').includes(searchTerm)
  );

  const handleAddBook = async () => {
    if (newBook.title && newBook.isbn) {
      // Check for duplicate ISBN
      const isDuplicate = books.some(b => 
        (b.isbn || b.ISBN || '').toLowerCase() === newBook.isbn.toLowerCase()
      );
      
      if (isDuplicate) {
        alert('This ISBN already exists. A new unique ISBN has been generated.');
        generateUniqueISBN();
        return;
      }
      
      try {
        const response = await apiClient.createBook({
          Title: newBook.title,
          ISBN: newBook.isbn,
          Publisher: newBook.category || null,
          PubYear: new Date().getFullYear(),
        });
        
        const newBookData = {
          bookId: response.data?.BookID || Date.now().toString(),
          id: response.data?.BookID || Date.now().toString(),
          title: response.data?.Title || newBook.title,
          isbn: response.data?.ISBN || newBook.isbn,
          category: response.data?.Publisher || newBook.category,
          totalCopies: newBook.totalCopies,
          availableCopies: newBook.totalCopies,
        };
        
        setBooks([...books, newBookData]);
        setNewBook({ title: '', author: '', isbn: '', category: '', totalCopies: 1 });
        setIsAddingBook(false);
      } catch (error: any) {
        console.error('Error creating book:', error);
        if (error?.response?.data?.message?.includes('Duplicate') || error?.response?.data?.message?.includes('ISBN')) {
          alert('This ISBN already exists in the database. A new unique ISBN has been generated.');
          generateUniqueISBN();
        } else {
          alert('Failed to create book. Please try again.');
        }
      }
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }
    
    try {
      await apiClient.deleteBook(id);
      setBooks(books.filter(b => (b.bookId || b.id || b.BookID) !== id));
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book. Please try again.');
    }
  };

  const handleEditBook = async () => {
    if (editingBook && editingBook.title && editingBook.isbn) {
      try {
        await apiClient.updateBook(editingBook.BookID || editingBook.bookId || editingBook.id || '', {
          Title: editingBook.title || editingBook.Title,
          ISBN: editingBook.isbn || editingBook.ISBN,
          Publisher: editingBook.category,
        });
        
        setBooks(books.map(b => 
          (b.BookID || b.bookId || b.id) === (editingBook.BookID || editingBook.bookId || editingBook.id) 
            ? editingBook 
            : b
        ));
        setEditingBook(null);
        alert('Book updated successfully!');
      } catch (error) {
        console.error('Error updating book:', error);
        alert('Failed to update book. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="md:ml-64 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-h2 text-neutral-900">Manage Books</h1>
              <Button
                onClick={() => {
                  setIsAddingBook(!isAddingBook);
                  if (isAddingBook) {
                    // Reset form when canceling
                    setNewBook({ title: '', author: '', isbn: '', category: '', totalCopies: 1 });
                  }
                }}
                variant="primary"
              >
                {isAddingBook ? 'Cancel' : '+ Add Book'}
              </Button>
            </div>

            {editingBook && (
              <div className="card mb-6 p-6">
                <h3 className="text-h5 text-neutral-900 mb-4">Edit Book</h3>
                <div className="space-y-4">
                  <Input
                    label="Title"
                    value={editingBook.title || editingBook.Title || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value, Title: e.target.value })}
                    placeholder="Book title"
                  />
                  <Input
                    label="ISBN"
                    value={editingBook.isbn || editingBook.ISBN || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value, ISBN: e.target.value })}
                    placeholder="ISBN"
                  />
                  <Input
                    label="Category/Publisher"
                    value={editingBook.category || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                    placeholder="Book category"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleEditBook} variant="primary">
                      Save Changes
                    </Button>
                    <Button onClick={() => setEditingBook(null)} variant="secondary">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isAddingBook && (
              <div className="card mb-6 p-6">
                <h3 className="text-h5 text-neutral-900 mb-4">Add New Book</h3>
                <div className="space-y-4">
                  <Input
                    label="Title"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    placeholder="Book title"
                  />
                  <Input
                    label="Author"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    placeholder="Author name"
                  />
                  <div>
                    <label className="block text-p4 font-semibold text-neutral-900 mb-2">
                      ISBN (Auto-generated)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={newBook.isbn}
                        onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                        placeholder="ISBN"
                        disabled={true}
                      />
                      <button
                        onClick={generateUniqueISBN}
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-semibold whitespace-nowrap"
                        type="button"
                      >
                        🔄 Regenerate
                      </button>
                    </div>
                    <p className="text-p6 text-neutral-500 mt-1">
                      ISBN is automatically generated to avoid duplicates. Click regenerate for a new one.
                    </p>
                  </div>
                  <Input
                    label="Category"
                    value={newBook.category}
                    onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                    placeholder="Book category"
                  />
                  <Input
                    label="Total Copies"
                    type="number"
                    value={newBook.totalCopies}
                    onChange={(e) => setNewBook({ ...newBook, totalCopies: parseInt(e.target.value) })}
                  />
                  <Button onClick={handleAddBook} variant="primary">
                    Add Book
                  </Button>
                </div>
              </div>
            )}

            <div className="card mb-6">
              <Input
                label="Search Books"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, author, or ISBN..."
              />
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="px-6 py-4 text-left text-p5 font-semibold text-neutral-900">Title</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold text-neutral-900">Author</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold text-neutral-900">ISBN</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold text-neutral-900">Category</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold text-neutral-900">Total</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold text-neutral-900">Available</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                        Loading books...
                      </td>
                    </tr>
                  ) : filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                        No books found
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book) => (
                      <tr key={book.BookID || book.bookId || book.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-6 py-4 text-p4 text-neutral-900 font-semibold">{book.title || book.Title}</td>
                        <td className="px-6 py-4 text-p4 text-neutral-600">{book.Authors || book.author || '-'}</td>
                        <td className="px-6 py-4 text-p4 text-neutral-600">{book.isbn || book.ISBN}</td>
                        <td className="px-6 py-4 text-p4">{book.Publisher || book.category || '-'}</td>
                        <td className="px-6 py-4 text-p4 text-neutral-900">{book.TotalCopies ?? book.totalCopies ?? '-'}</td>
                        <td className="px-6 py-4 text-p4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-tag-sm font-semibold ${
                              (book.AvailableCopies ?? book.availableCopies ?? 0) > 0
                                ? 'bg-status-success-bg text-status-success'
                                : 'bg-status-error-bg text-status-error'
                            }`}
                          >
                            {book.AvailableCopies ?? book.availableCopies ?? '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-p4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingBook(book)}
                              className="text-primary-600 hover:underline font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.BookID || book.bookId || book.id || '')}
                              className="text-status-error hover:underline font-semibold"
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

            <div className="mt-6 text-p4 text-neutral-600">
              Showing {filteredBooks.length} of {books.length} books
            </div>
          </div>
        </main>
      </div>
  );
}
