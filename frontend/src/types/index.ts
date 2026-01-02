// Auth types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'librarian' | 'assistant' | 'member';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Book types
export interface Book {
  bookId: string;
  title: string;
  author: string;
  isbn: string;
  publishYear: number;
  category: string;
  totalCopies: number;
  availableCopies: number;
  description: string;
  imageUrl?: string;
}

export interface BookCopy {
  copyId: string;
  bookId: string;
  status: 'available' | 'borrowed' | 'reserved' | 'damaged' | 'lost';
  barcode: string;
}

// Loan types
export interface Loan {
  loanId: string;
  memberId: string;
  copyId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'active' | 'returned' | 'overdue';
  fineAmount?: number;
}

// Reservation types
export interface Reservation {
  reservationId: string;
  memberId: string;
  bookId: string;
  reservationDate: string;
  status: 'pending' | 'ready' | 'cancelled';
  position: number;
}

// Fine types
export interface Fine {
  fineId: string;
  memberId: string;
  loanId?: string;
  amount: number;
  reason: string;
  issueDate: string;
  status: 'unpaid' | 'paid';
  paidDate?: string;
}

// Member types
export interface Member extends User {
  membershipDate: string;
  membershipExpiry: string;
  totalLoans: number;
  activeLoans: number;
  finesOwed: number;
}

// Staff types
export interface Staff extends User {
  department: string;
  joinDate: string;
  permissions: string[];
}

// Supplier types
export interface Supplier {
  supplierId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  contactPerson: string;
  rating: number;
}

// Purchase Order types
export interface PurchaseOrder {
  orderId: string;
  supplierId: string;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  itemId: string;
  bookId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Audit Log types
export interface AuditLog {
  logId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  details: Record<string, any>;
}

// Notification types
export interface Notification {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

// Report types
export interface Report {
  reportId: string;
  reportType: string;
  title: string;
  generatedDate: string;
  generatedBy: string;
  data: Record<string, any>;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
