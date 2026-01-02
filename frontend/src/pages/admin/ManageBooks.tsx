import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';
import Input from '@/components/Input';

interface Book {
  bookId: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
}

export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([
    {
      bookId: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '9780743273565',
      category: 'Fiction',
      totalCopies: 5,
      availableCopies: 3,
    },
    {
      bookId: '2',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '9780061120084',
      category: 'Fiction',
      totalCopies: 3,
      availableCopies: 2,
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    totalCopies: 1,
  });

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
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.isbn.includes(searchTerm)
  );

  const handleAddBook = () => {
    if (newBook.title && newBook.author && newBook.isbn) {
      setBooks([
        ...books,
        {
          bookId: Date.now().toString(),
          title: newBook.title,
          author: newBook.author,
          isbn: newBook.isbn,
          category: newBook.category,
          totalCopies: newBook.totalCopies,
          availableCopies: newBook.totalCopies,
        },
      ]);
      setNewBook({ title: '', author: '', isbn: '', category: '', totalCopies: 1 });
      setIsAddingBook(false);
    }
  };

  const handleDeleteBook = (id: string) => {
    setBooks(books.filter(b => b.bookId !== id));
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
                onClick={() => setIsAddingBook(!isAddingBook)}
                variant="primary"
              >
                {isAddingBook ? 'Cancel' : '+ Add Book'}
              </Button>
            </div>

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
                  <Input
                    label="ISBN"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    placeholder="ISBN"
                  />
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
                  {filteredBooks.map((book) => (
                    <tr key={book.bookId} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-6 py-4 text-p4 text-neutral-900 font-semibold">{book.title}</td>
                      <td className="px-6 py-4 text-p4 text-neutral-600">{book.author}</td>
                      <td className="px-6 py-4 text-p4 text-neutral-600">{book.isbn}</td>
                      <td className="px-6 py-4 text-p4">{book.category}</td>
                      <td className="px-6 py-4 text-p4 text-neutral-900">{book.totalCopies}</td>
                      <td className="px-6 py-4 text-p4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-tag-sm font-semibold ${
                            book.availableCopies > 0
                              ? 'bg-status-success-bg text-status-success'
                              : 'bg-status-error-bg text-status-error'
                          }`}
                        >
                          {book.availableCopies}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-p4">
                        <button
                          onClick={() => handleDeleteBook(book.bookId)}
                          className="text-status-error hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
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
