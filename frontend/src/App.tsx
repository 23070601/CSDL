import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Home from '@/pages/Home';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminProfile from '@/pages/admin/Profile';
import ManageStaff from '@/pages/admin/ManageStaff';
import ManageBooks from '@/pages/admin/ManageBooks';
import ManageSuppliers from '@/pages/admin/ManageSuppliers';
import ManagePurchaseOrders from '@/pages/admin/ManagePurchaseOrders';
import AdminReports from '@/pages/admin/Reports';
import AuditLogs from '@/pages/admin/AuditLogs';
import SystemConfig from '@/pages/admin/SystemConfig';

// Librarian pages
import LibrarianDashboard from '@/pages/librarian/Dashboard';
import LibrarianProfile from '@/pages/librarian/Profile';
import ManageCirculation from '@/pages/librarian/ManageCirculation';
import ManageMembers from '@/pages/librarian/ManageMembers';
import LibrarianReports from '@/pages/librarian/Reports';
import ManageReservations from '@/pages/librarian/ManageReservations';
import ManageFines from '@/pages/librarian/ManageFines';

// Assistant pages (reuse librarian components)
import AssistantDashboard from '@/pages/librarian/Dashboard';
import AssistantProfile from '@/pages/librarian/Profile';
import AssistantCirculation from '@/pages/librarian/ManageCirculation';
import AssistantReservations from '@/pages/librarian/ManageReservations';

// Member pages
import MemberDashboard from '@/pages/member/Dashboard';
import SearchBooks from '@/pages/member/SearchBooks';
import MyLoans from '@/pages/member/MyLoans';
import MyFines from '@/pages/member/MyFines';
import MyProfile from '@/pages/member/MyProfile';
import MyReservations from '@/pages/member/MyReservations';
import MyNotifications from '@/pages/member/MyNotifications';

import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute role="admin" element={<AdminDashboard />} />}
        />
        <Route
          path="/admin/profile"
          element={<ProtectedRoute role="admin" element={<AdminProfile />} />}
        />
        <Route
          path="/admin/staff"
          element={<ProtectedRoute role="admin" element={<ManageStaff />} />}
        />
        <Route
          path="/admin/books"
          element={<ProtectedRoute role="admin" element={<ManageBooks />} />}
        />
        <Route
          path="/admin/suppliers"
          element={<ProtectedRoute role="admin" element={<ManageSuppliers />} />}
        />
        <Route
          path="/admin/purchase-orders"
          element={
            <ProtectedRoute role="admin" element={<ManagePurchaseOrders />} />
          }
        />
        <Route
          path="/admin/reports"
          element={<ProtectedRoute role="admin" element={<AdminReports />} />}
        />
        <Route
          path="/admin/audit-logs"
          element={<ProtectedRoute role="admin" element={<AuditLogs />} />}
        />
        <Route
          path="/admin/config"
          element={<ProtectedRoute role="admin" element={<SystemConfig />} />}
        />

        {/* Librarian routes */}
        <Route
          path="/librarian/dashboard"
          element={<ProtectedRoute role="librarian" element={<LibrarianDashboard />} />}
        />
        <Route
          path="/librarian/profile"
          element={<ProtectedRoute role="librarian" element={<LibrarianProfile />} />}
        />
        <Route
          path="/librarian/circulation"
          element={
            <ProtectedRoute role="librarian" element={<ManageCirculation />} />
          }
        />
        <Route
          path="/librarian/members"
          element={
            <ProtectedRoute role="librarian" element={<ManageMembers />} />
          }
        />
        <Route
          path="/librarian/reports"
          element={
            <ProtectedRoute role="librarian" element={<LibrarianReports />} />
          }
        />
        <Route
          path="/librarian/reservations"
          element={
            <ProtectedRoute role="librarian" element={<ManageReservations />} />
          }
        />
        <Route
          path="/librarian/fines"
          element={
            <ProtectedRoute role="librarian" element={<ManageFines />} />
          }
        />

        {/* Assistant routes */}
        <Route
          path="/assistant/dashboard"
          element={<ProtectedRoute role="assistant" element={<AssistantDashboard />} />}
        />
        <Route
          path="/assistant/profile"
          element={<ProtectedRoute role="assistant" element={<AssistantProfile />} />}
        />
        <Route
          path="/assistant/circulation"
          element={<ProtectedRoute role="assistant" element={<AssistantCirculation />} />}
        />
        <Route
          path="/assistant/reservations"
          element={<ProtectedRoute role="assistant" element={<AssistantReservations />} />}
        />

        {/* Member routes */}
        <Route
          path="/member/dashboard"
          element={<ProtectedRoute role="member" element={<MemberDashboard />} />}
        />
        <Route
          path="/member/profile"
          element={<ProtectedRoute role="member" element={<MyProfile />} />}
        />
        <Route
          path="/member/books"
          element={<ProtectedRoute role="member" element={<SearchBooks />} />}
        />
        <Route
          path="/member/loans"
          element={<ProtectedRoute role="member" element={<MyLoans />} />}
        />
        <Route
          path="/member/fines"
          element={<ProtectedRoute role="member" element={<MyFines />} />}
        />
        <Route
          path="/member/profile"
          element={<ProtectedRoute role="member" element={<MyProfile />} />}
        />
        <Route
          path="/member/reservations"
          element={<ProtectedRoute role="member" element={<MyReservations />} />}
        />
        <Route
          path="/member/notifications"
          element={<ProtectedRoute role="member" element={<MyNotifications />} />}
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
