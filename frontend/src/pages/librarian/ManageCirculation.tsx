import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { apiClient } from '@/utils/api';

interface Loan {
  loanID?: string;
  LoanID?: string;
  memberID?: string;
  MemberID?: string;
  memberName?: string;
  MemberName?: string;
  bookID?: string;
  BookID?: string;
  bookTitle?: string;
  BookTitle?: string;
  loanDate?: string;
  LoanDate?: string;
  dueDate?: string;
  DueDate?: string;
  returnDate?: string;
  ReturnDate?: string;
  status?: string;
  Status?: string;
}

export default function ManageCirculation() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'borrowed' | 'returned' | 'overdue'>('all');
  const [activeTab, setActiveTab] = useState<'loans' | 'borrow' | 'return'>('loans');
  
  // Borrow form with search queries
  const [borrowForm, setBorrowForm] = useState({
    memberID: '',
    bookID: '',
    borrowerName: '',
    contactEmail: '',
    contactPhone: '',
    bookTitle: '',
    author: '',
    isbn: '',
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    bookCondition: 'Good',
    acknowledgment: false,
  });

  // Search/suggestion state
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [showMemberSuggestions, setShowMemberSuggestions] = useState(false);
  const [showBookSuggestions, setShowBookSuggestions] = useState(false);
  
  // Return form with detailed information
  const [returnForm, setReturnForm] = useState({
    loanID: '',
    memberID: '',
    borrowerName: '',
    bookID: '',
    bookTitle: '',
    isbn: '',
    loanDate: '',
    dueDate: '',
    returnDate: new Date().toISOString().split('T')[0],
    bookConditionAtCheckout: 'Good',
    bookConditionUponReturn: 'Good',
    lateFeeAssessed: 0,
    notes: '',
  });

  // Return form search state
  const [loanSearchQuery, setLoanSearchQuery] = useState('');
  const [showLoanSuggestions, setShowLoanSuggestions] = useState(false);

  const sidebarItems = [
    { label: 'Dashboard', path: '/librarian/dashboard', icon: '📊' },
    { label: 'Manage Circulation', path: '/librarian/circulation', icon: '📖' },
    { label: 'Manage Reservations', path: '/librarian/reservations', icon: '📋' },
    { label: 'Manage Members', path: '/librarian/members', icon: '👥' },
    { label: 'Manage Fines', path: '/librarian/fines', icon: '💳' },
    { label: 'Reports', path: '/librarian/reports', icon: '📈' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, membersRes, booksRes] = await Promise.all([
        apiClient.getLoans(),
        apiClient.getMembers(),
        apiClient.getBooks(),
      ]);
      setLoans(loansRes.data || []);
      setMembers(membersRes.data || []);
      setBooks(booksRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      (loan.memberName || loan.MemberName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loan.bookTitle || loan.BookTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loan.loanID || loan.LoanID || '').toString().includes(searchTerm);
    
    if (!matchesSearch) return false;

    const status = (loan.status || loan.Status || '').toLowerCase();
    const dueDate = loan.dueDate || loan.DueDate;
    const isOverdue = status === 'borrowed' && dueDate && new Date(dueDate) < new Date();

    switch (statusFilter) {
      case 'borrowed':
        return status === 'borrowed' && !isOverdue;
      case 'returned':
        return status === 'returned';
      case 'overdue':
        return isOverdue;
      default:
        return true;
    }
  });

  const handleBorrow = async () => {
    if (!borrowForm.memberID || !borrowForm.bookID) {
      alert('Please select both member and book');
      return;
    }

    if (!borrowForm.acknowledgment) {
      alert('Please acknowledge the terms and conditions by checking the box');
      return;
    }

    try {
      await apiClient.borrowBook({
        MemberID: borrowForm.memberID,
        BookID: borrowForm.bookID,
      });
      alert('Book borrowed successfully!');
      setBorrowForm({ 
        memberID: '', 
        bookID: '',
        borrowerName: '',
        contactEmail: '',
        contactPhone: '',
        bookTitle: '',
        author: '',
        isbn: '',
        borrowDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        bookCondition: 'Good',
        acknowledgment: false,
      });
      fetchData();
      setActiveTab('loans');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error borrowing book');
    }
  };

  // Handle member selection - auto-fill member details
  const handleMemberSelect = (memberID: string) => {
    const selectedMember = members.find(m => (m.MemberID || m.memberID) === memberID);
    if (selectedMember) {
      // Calculate due date (14 days from today)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      
      setBorrowForm({
        ...borrowForm,
        memberID,
        borrowerName: selectedMember.Name || selectedMember.name || '',
        contactEmail: selectedMember.Email || selectedMember.email || '',
        contactPhone: selectedMember.Phone || selectedMember.phone || '',
        dueDate: dueDate.toISOString().split('T')[0],
      });
      setMemberSearchQuery(`${selectedMember.Name || selectedMember.name} (${selectedMember.Email || selectedMember.email})`);
      setShowMemberSuggestions(false);
    }
  };

  // Filter members by search query
  const filteredMembers = members.filter(m => {
    if (!memberSearchQuery.trim()) return false;
    const name = (m.Name || m.name || '').toLowerCase();
    const email = (m.Email || m.email || '').toLowerCase();
    const query = memberSearchQuery.toLowerCase();
    return (m.Status || m.status)?.toLowerCase() === 'active' && 
           (name.includes(query) || email.includes(query));
  });

  // Handle book selection - auto-fill book details
  const handleBookSelect = (bookID: string) => {
    const selectedBook = books.find(b => (b.BookID || b.bookID) === bookID);
    if (selectedBook) {
      setBorrowForm({
        ...borrowForm,
        bookID,
        bookTitle: selectedBook.Title || selectedBook.title || '',
        author: selectedBook.Authors || selectedBook.author || 'Unknown',
        isbn: selectedBook.ISBN || selectedBook.isbn || '',
      });
      setBookSearchQuery(selectedBook.Title || selectedBook.title || '');
      setShowBookSuggestions(false);
    }
  };

  // Filter books by search query
  const filteredBooks = books.filter(b => {
    if (!bookSearchQuery.trim()) return false;
    const title = (b.Title || b.title || '').toLowerCase();
    const author = (b.Authors || b.author || '').toLowerCase();
    const query = bookSearchQuery.toLowerCase();
    return (b.AvailableCopies || b.availableCopies || 0) > 0 && 
           (title.includes(query) || author.includes(query));
  });

  const handleReturn = async () => {
    if (!returnForm.loanID) {
      alert('Please select a loan to return');
      return;
    }

    try {
      await apiClient.returnBook(returnForm.loanID);
      alert('Book returned successfully!');
      setReturnForm({
        loanID: '',
        memberID: '',
        borrowerName: '',
        bookID: '',
        bookTitle: '',
        isbn: '',
        loanDate: '',
        dueDate: '',
        returnDate: new Date().toISOString().split('T')[0],
        bookConditionAtCheckout: 'Good',
        bookConditionUponReturn: 'Good',
        lateFeeAssessed: 0,
        notes: '',
      });
      setLoanSearchQuery('');
      fetchData();
      setActiveTab('loans');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error returning book');
    }
  };

  // Handle loan selection - auto-fill return form
  const handleLoanSelect = (loan: Loan) => {
    // Calculate late fee (if due date passed)
    let lateFee = 0;
    const dueDate = new Date(loan.dueDate || loan.DueDate || '');
    const returnDate = new Date(returnForm.returnDate);
    const daysOverdue = Math.max(0, Math.floor((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    if (daysOverdue > 0) {
      lateFee = daysOverdue * 1.5; // $1.50 per day
    }

    setReturnForm({
      ...returnForm,
      loanID: loan.loanID || loan.LoanID || '',
      memberID: loan.memberID || loan.MemberID || '',
      borrowerName: loan.memberName || loan.MemberName || '',
      bookID: loan.bookID || loan.BookID || '',
      bookTitle: loan.bookTitle || loan.BookTitle || '',
      isbn: '',
      loanDate: (loan.loanDate || loan.LoanDate || '').substring(0, 10),
      dueDate: (loan.dueDate || loan.DueDate || '').substring(0, 10),
      lateFeeAssessed: lateFee,
    });
    setLoanSearchQuery(`${loan.BookTitle || loan.bookTitle} - ${loan.MemberName || loan.memberName}`);
    setShowLoanSuggestions(false);
  };

  // Filter borrowed loans by search query
  const filteredReturnLoans = loans.filter(loan => {
    if (!loanSearchQuery.trim()) return false;
    const bookTitle = (loan.bookTitle || loan.BookTitle || '').toLowerCase();
    const memberName = (loan.memberName || loan.MemberName || '').toLowerCase();
    const loanId = (loan.loanID || loan.LoanID || '').toString().toLowerCase();
    const query = loanSearchQuery.toLowerCase();
    return (loan.status || loan.Status)?.toLowerCase() === 'borrowed' &&
           (bookTitle.includes(query) || memberName.includes(query) || loanId.includes(query));
  });

  const handleRenew = async (loanID: string) => {
    try {
      await apiClient.renewLoan(loanID);
      alert('Loan renewed successfully!');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error renewing loan');
    }
  };

  const getStatusBadge = (loan: Loan) => {
    const status = (loan.status || loan.Status || '').toLowerCase();
    const dueDate = loan.dueDate || loan.DueDate;
    const isOverdue = status === 'borrowed' && dueDate && new Date(dueDate) < new Date();

    if (isOverdue) {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">Overdue</span>;
    }
    
    return status === 'borrowed' ? (
      <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">Borrowed</span>
    ) : (
      <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">Returned</span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="flex">
          <Sidebar items={sidebarItems} />
          <main className="flex-1 p-6 md:ml-64">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-neutral-600">Loading circulation data...</p>
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
            <h1 className="text-h2 text-neutral-900 mb-8">Manage Circulation</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab('loans')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === 'loans'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                📖 Active Loans
              </button>
              <button
                onClick={() => setActiveTab('borrow')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === 'borrow'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                ➕ Borrow Book
              </button>
              <button
                onClick={() => setActiveTab('return')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === 'return'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                ✅ Return Book
              </button>
            </div>

            {/* Loans List */}
            {activeTab === 'loans' && (
              <div className="card">
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Search"
                    placeholder="Search by member, book, or loan ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select
                    label="Filter by Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    options={[
                      { value: 'all', label: 'All Loans' },
                      { value: 'borrowed', label: 'Borrowed' },
                      { value: 'returned', label: 'Returned' },
                      { value: 'overdue', label: 'Overdue' },
                    ]}
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 border-b-2 border-neutral-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-700">Loan ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-700">Book</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-700">Member</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-700">Loan Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-700">Due Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoans.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-neutral-500">
                            No loans found
                          </td>
                        </tr>
                      ) : (
                        filteredLoans.map((loan) => (
                          <tr key={loan.loanID || loan.LoanID} className="border-b border-neutral-200 hover:bg-neutral-50">
                            <td className="py-3 px-4">{loan.loanID || loan.LoanID}</td>
                            <td className="py-3 px-4">{loan.bookTitle || loan.BookTitle}</td>
                            <td className="py-3 px-4">{loan.memberName || loan.MemberName}</td>
                            <td className="py-3 px-4">
                              {new Date(loan.loanDate || loan.LoanDate || '').toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              {new Date(loan.dueDate || loan.DueDate || '').toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">{getStatusBadge(loan)}</td>
                            <td className="py-3 px-4">
                              {(loan.status || loan.Status)?.toLowerCase() === 'borrowed' && (
                                <Button
                                  variant="secondary"
                                  onClick={() => handleRenew(loan.loanID || loan.LoanID || '')}
                                  className="text-sm"
                                >
                                  Renew
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Borrow Form */}
            {activeTab === 'borrow' && (
              <div className="card max-w-4xl">
                <h2 className="text-h5 text-neutral-900 mb-6 flex items-center gap-2">
                  <span>📝</span> Borrow Book Form
                </h2>
                
                <div className="space-y-6">
                  {/* Member Selection Section */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <span>👤</span> Borrower Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 relative">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Search Member by Name or Email *
                        </label>
                        <input
                          type="text"
                          placeholder="Type member name or email to search..."
                          value={memberSearchQuery}
                          onChange={(e) => {
                            setMemberSearchQuery(e.target.value);
                            setShowMemberSuggestions(true);
                            setBorrowForm({
                              ...borrowForm,
                              memberID: '',
                              borrowerName: '',
                              contactEmail: '',
                              contactPhone: '',
                            });
                          }}
                          onFocus={() => setShowMemberSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowMemberSuggestions(false), 200)}
                          className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-600 focus:outline-none"
                        />
                        
                        {/* Member Suggestions Dropdown */}
                        {showMemberSuggestions && memberSearchQuery.trim() && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                            {filteredMembers.length > 0 ? (
                              filteredMembers.map((member) => (
                                <button
                                  key={member.MemberID || member.memberID}
                                  onClick={() => handleMemberSelect(member.MemberID || member.memberID)}
                                  className="w-full text-left px-4 py-3 hover:bg-blue-100 border-b border-neutral-200 last:border-b-0 transition-colors"
                                >
                                  <div className="font-semibold text-neutral-900">{member.Name || member.name}</div>
                                  <div className="text-sm text-neutral-600">{member.Email || member.email}</div>
                                  <div className="text-xs text-neutral-500">ID: {member.MemberID || member.memberID}</div>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-neutral-500 text-sm">
                                No active members found matching your search
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Input
                        label="Borrower's Full Name"
                        value={borrowForm.borrowerName}
                        readOnly
                        className="bg-white"
                        placeholder="Auto-filled from member selection"
                      />
                      <Input
                        label="Email Address"
                        value={borrowForm.contactEmail}
                        readOnly
                        className="bg-white"
                        placeholder="Auto-filled from member selection"
                      />
                      <Input
                        label="Phone Number"
                        value={borrowForm.contactPhone}
                        readOnly
                        className="bg-white"
                        placeholder="Auto-filled from member selection"
                      />
                      <Input
                        label="Member ID"
                        value={borrowForm.memberID}
                        readOnly
                        className="bg-white"
                        placeholder="Member identifier"
                      />
                    </div>
                  </div>

                  {/* Book Selection Section */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <span>📚</span> Book Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 relative">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Search Book by Title or Author *
                        </label>
                        <input
                          type="text"
                          placeholder="Type book title or author name to search..."
                          value={bookSearchQuery}
                          onChange={(e) => {
                            setBookSearchQuery(e.target.value);
                            setShowBookSuggestions(true);
                            setBorrowForm({
                              ...borrowForm,
                              bookID: '',
                              bookTitle: '',
                              author: '',
                              isbn: '',
                            });
                          }}
                          onFocus={() => setShowBookSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowBookSuggestions(false), 200)}
                          className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-600 focus:outline-none"
                        />
                        
                        {/* Book Suggestions Dropdown */}
                        {showBookSuggestions && bookSearchQuery.trim() && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-green-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                            {filteredBooks.length > 0 ? (
                              filteredBooks.map((book) => (
                                <button
                                  key={book.BookID || book.bookID}
                                  onClick={() => handleBookSelect(book.BookID || book.bookID)}
                                  className="w-full text-left px-4 py-3 hover:bg-green-100 border-b border-neutral-200 last:border-b-0 transition-colors"
                                >
                                  <div className="font-semibold text-neutral-900">{book.Title || book.title}</div>
                                  <div className="text-sm text-neutral-600">Author: {book.Authors || book.author || 'Unknown'}</div>
                                  <div className="text-xs text-neutral-500">ISBN: {book.ISBN || book.isbn || 'N/A'} | Available: {book.AvailableCopies || book.availableCopies}</div>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-neutral-500 text-sm">
                                No available books found matching your search
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Input
                        label="Book Title"
                        value={borrowForm.bookTitle}
                        readOnly
                        className="bg-white"
                        placeholder="Auto-filled from book selection"
                      />
                      <Input
                        label="Author"
                        value={borrowForm.author}
                        readOnly
                        className="bg-white"
                        placeholder="Auto-filled from book selection"
                      />
                      <Input
                        label="ISBN / Book Number"
                        value={borrowForm.isbn}
                        readOnly
                        className="bg-white"
                        placeholder="Auto-filled from book selection"
                      />
                      <Input
                        label="Book ID"
                        value={borrowForm.bookID}
                        readOnly
                        className="bg-white"
                        placeholder="Book identifier"
                      />
                    </div>
                  </div>

                  {/* Loan Details Section */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <span>📅</span> Loan Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Date Borrowed (Check-out Date)"
                        type="date"
                        value={borrowForm.borrowDate}
                        readOnly
                        className="bg-white"
                      />
                      <Input
                        label="Expected Return Date (Due Date)"
                        type="date"
                        value={borrowForm.dueDate}
                        readOnly
                        className="bg-white"
                        placeholder="Calculated as 14 days from borrow date"
                      />
                      <Select
                        label="Book Condition at Checkout"
                        value={borrowForm.bookCondition}
                        onChange={(e) => setBorrowForm({ ...borrowForm, bookCondition: e.target.value })}
                        options={[
                          { value: 'Excellent', label: 'Excellent - Like new' },
                          { value: 'Good', label: 'Good - Normal wear' },
                          { value: 'Fair', label: 'Fair - Some damage' },
                          { value: 'Poor', label: 'Poor - Significant damage' },
                        ]}
                      />
                    </div>
                    <div className="mt-4 p-3 bg-white rounded border border-purple-300">
                      <p className="text-sm text-neutral-700 mb-2">
                        <strong>Loan Period:</strong> 14 days
                      </p>
                      <p className="text-sm text-neutral-600">
                        The book must be returned by the due date to avoid late fees. 
                        Late fees are calculated at $1.50 per day after the due date.
                      </p>
                    </div>
                  </div>

                  {/* Terms and Acknowledgment Section */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <span>✍️</span> Terms and Acknowledgment
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded border border-yellow-300 text-sm text-neutral-700 space-y-2">
                        <p><strong>Borrower Responsibilities:</strong></p>
                        <ul className="list-disc ml-5 space-y-1">
                          <li>Return the book by the due date in the same condition as received</li>
                          <li>Pay any applicable late fees if the book is returned after the due date</li>
                          <li>Report any damage or loss of the book immediately</li>
                          <li>Not lend the book to others without library permission</li>
                          <li>Pay replacement costs if the book is lost or damaged beyond repair</li>
                        </ul>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-white rounded border border-yellow-300">
                        <input
                          type="checkbox"
                          id="acknowledgment"
                          checked={borrowForm.acknowledgment}
                          onChange={(e) => setBorrowForm({ ...borrowForm, acknowledgment: e.target.checked })}
                          className="mt-1 h-5 w-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="acknowledgment" className="text-sm text-neutral-700 cursor-pointer">
                          <strong className="text-neutral-900">Digital Signature & Acknowledgment *</strong>
                          <br />
                          I acknowledge that I have read and understood the terms and conditions above. 
                          I agree to return the book in good condition by the due date and accept responsibility 
                          for any late fees, damage, or loss. This digital acknowledgment serves as my signature.
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-neutral-200">
                    <Button 
                      onClick={handleBorrow}
                      disabled={!borrowForm.memberID || !borrowForm.bookID || !borrowForm.acknowledgment}
                      className="flex-1"
                    >
                      ✓ Process Loan & Issue Book
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setBorrowForm({
                          memberID: '',
                          bookID: '',
                          borrowerName: '',
                          contactEmail: '',
                          contactPhone: '',
                          bookTitle: '',
                          author: '',
                          isbn: '',
                          borrowDate: new Date().toISOString().split('T')[0],
                          dueDate: '',
                          bookCondition: 'Good',
                          acknowledgment: false,
                        });
                        setActiveTab('loans');
                      }}
                      className="w-32"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Return Form */}
            {activeTab === 'return' && (
              <div className="card max-w-4xl">
                <h2 className="text-h5 text-neutral-900 mb-6 flex items-center gap-2">
                  <span>📋</span> Return Book Form
                </h2>
                
                <div className="space-y-6">
                  {/* Loan Selection Section */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <span>📖</span> Loan Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 relative">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Search Loan by Book Title, Member Name, or Loan ID *
                        </label>
                        <input
                          type="text"
                          placeholder="Type to search active loans..."
                          value={loanSearchQuery}
                          onChange={(e) => {
                            setLoanSearchQuery(e.target.value);
                            setShowLoanSuggestions(true);
                            setReturnForm({
                              ...returnForm,
                              loanID: '',
                              memberID: '',
                              borrowerName: '',
                              bookID: '',
                              bookTitle: '',
                              isbn: '',
                              loanDate: '',
                              dueDate: '',
                            });
                          }}
                          onFocus={() => setShowLoanSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowLoanSuggestions(false), 200)}
                          className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-600 focus:outline-none"
                        />
                        
                        {/* Loan Suggestions Dropdown */}
                        {showLoanSuggestions && loanSearchQuery.trim() && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                            {filteredReturnLoans.length > 0 ? (
                              filteredReturnLoans.map((loan) => (
                                <button
                                  key={loan.loanID || loan.LoanID}
                                  onClick={() => handleLoanSelect(loan)}
                                  className="w-full text-left px-4 py-3 hover:bg-blue-100 border-b border-neutral-200 last:border-b-0 transition-colors"
                                >
                                  <div className="font-semibold text-neutral-900">{loan.BookTitle || loan.bookTitle}</div>
                                  <div className="text-sm text-neutral-600">Borrower: {loan.MemberName || loan.memberName}</div>
                                  <div className="text-xs text-neutral-500">Loan ID: {loan.LoanID || loan.loanID} | Borrowed: {(loan.loanDate || loan.LoanDate) ? new Date(loan.loanDate || loan.LoanDate || '').toLocaleDateString() : 'N/A'}</div>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-neutral-500 text-sm">
                                No active borrowed loans found matching your search
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Input
                        label="Borrower's Name"
                        value={returnForm.borrowerName}
                        readOnly
                        className="bg-white"
                        placeholder="Auto-filled from loan selection"
                      />
                      <Input
                        label="Loan ID"
                        value={returnForm.loanID}
                        readOnly
                        className="bg-white"
                        placeholder="Loan identifier"
                      />
                    </div>
                  </div>

                  {/* Book Information Section */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <span>📚</span> Book Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Book Title"
                        value={returnForm.bookTitle}
                        readOnly
                        className="bg-white md:col-span-2"
                        placeholder="Auto-filled from loan selection"
                      />
                      <Input
                        label="ISBN / Book Number"
                        value={returnForm.isbn}
                        readOnly
                        className="bg-white"
                        placeholder="Auto-filled from loan selection"
                      />
                      <Input
                        label="Book ID"
                        value={returnForm.bookID}
                        readOnly
                        className="bg-white"
                        placeholder="Auto-filled from loan selection"
                      />
                    </div>
                  </div>

                  {/* Loan Duration Section */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <span>📅</span> Loan Duration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Date Borrowed (Check-out Date)"
                        type="date"
                        value={returnForm.loanDate}
                        readOnly
                        className="bg-white"
                        placeholder="Auto-filled from loan selection"
                      />
                      <Input
                        label="Expected Return Date (Due Date)"
                        type="date"
                        value={returnForm.dueDate}
                        readOnly
                        className="bg-white"
                        placeholder="Auto-filled from loan selection"
                      />
                      <Input
                        label="Actual Return Date (Check-in Date)"
                        type="date"
                        value={returnForm.returnDate}
                        onChange={(e) => {
                          setReturnForm({ ...returnForm, returnDate: e.target.value });
                          // Recalculate late fees
                          const dueDate = new Date(returnForm.dueDate);
                          const returnDate = new Date(e.target.value);
                          const daysOverdue = Math.max(0, Math.floor((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
                          const lateFee = daysOverdue * 1.5;
                          setReturnForm(prev => ({ ...prev, lateFeeAssessed: lateFee }));
                        }}
                      />
                    </div>
                    {returnForm.dueDate && (
                      <div className="mt-3 p-3 bg-white rounded border border-purple-300 text-sm">
                        <p className="text-neutral-700">
                          <strong>Loan Status:</strong>{' '}
                          {new Date(returnForm.returnDate) <= new Date(returnForm.dueDate) ? (
                            <span className="text-green-600">✓ Returned On Time</span>
                          ) : (
                            <span className="text-red-600">
                              ⚠ {Math.floor((new Date(returnForm.returnDate).getTime() - new Date(returnForm.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Book Condition Section */}
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <span>🔍</span> Book Condition Report
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Condition at Check-out
                        </label>
                        <input
                          type="text"
                          value={returnForm.bookConditionAtCheckout}
                          readOnly
                          className="w-full px-4 py-2 bg-gray-100 border border-neutral-300 rounded-lg text-neutral-600"
                        />
                      </div>
                      <Select
                        label="Condition Upon Return *"
                        value={returnForm.bookConditionUponReturn}
                        onChange={(e) => setReturnForm({ ...returnForm, bookConditionUponReturn: e.target.value })}
                        options={[
                          { value: 'Excellent', label: 'Excellent - Like new' },
                          { value: 'Good', label: 'Good - Normal wear' },
                          { value: 'Fair', label: 'Fair - Some damage' },
                          { value: 'Poor', label: 'Poor - Significant damage' },
                        ]}
                      />
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Additional Notes (Damage Report)
                      </label>
                      <textarea
                        value={returnForm.notes}
                        onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                        placeholder="Describe any damage, missing pages, markings, etc..."
                        className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-600 focus:outline-none"
                        rows={3}
                      />
                    </div>
                    {returnForm.bookConditionAtCheckout !== returnForm.bookConditionUponReturn && (
                      <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-sm text-red-800">
                        ⚠️ Note: Book condition has changed from {returnForm.bookConditionAtCheckout} to {returnForm.bookConditionUponReturn}
                      </div>
                    )}
                  </div>

                  {/* Fees Section */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <span>💰</span> Late Fees Assessment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Late Fee Rate
                        </label>
                        <input
                          type="text"
                          value="$1.50 per day"
                          readOnly
                          className="w-full px-4 py-2 bg-gray-100 border border-neutral-300 rounded-lg text-neutral-600"
                        />
                      </div>
                      <Input
                        label="Late Fees Assessed"
                        type="number"
                        value={returnForm.lateFeeAssessed.toFixed(2)}
                        readOnly
                        className="bg-white"
                        placeholder="Auto-calculated based on days overdue"
                      />
                    </div>
                    {returnForm.lateFeeAssessed > 0 && (
                      <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-sm">
                        <p className="text-red-800">
                          <strong>⚠️ Late Fee Due:</strong> ${returnForm.lateFeeAssessed.toFixed(2)}
                        </p>
                        <p className="text-red-700 text-xs mt-1">
                          This fee should be collected from the borrower before checkout.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-neutral-200">
                    <Button
                      onClick={handleReturn}
                      disabled={!returnForm.loanID}
                      className="flex-1"
                    >
                      ✓ Process Book Return
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setReturnForm({
                          loanID: '',
                          memberID: '',
                          borrowerName: '',
                          bookID: '',
                          bookTitle: '',
                          isbn: '',
                          loanDate: '',
                          dueDate: '',
                          returnDate: new Date().toISOString().split('T')[0],
                          bookConditionAtCheckout: 'Good',
                          bookConditionUponReturn: 'Good',
                          lateFeeAssessed: 0,
                          notes: '',
                        });
                        setLoanSearchQuery('');
                        setActiveTab('loans');
                      }}
                      className="w-32"
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
    </div>
  );
}
