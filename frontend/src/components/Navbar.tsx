import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { FiMenu, FiX, FiLogOut, FiBell, FiUser } from 'react-icons/fi';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <nav className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="container-main flex justify-between items-center py-4">
          <Link to="/" className="text-h5 font-bold text-primary-600">
            📚 LMS
          </Link>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="btn-primary text-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-outline text-sm"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  const dashboardLink = {
    admin: '/admin/dashboard',
    librarian: '/librarian/dashboard',
    assistant: '/librarian/dashboard',
    member: '/member/dashboard',
  }[user.role] || '/';

  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-50">
      <div className="container-main">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to={dashboardLink} className="text-h5 font-bold text-primary-600">
            📚 LMS
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <span className="text-p4 text-neutral-600">
              {user.fullName} <span className="text-neutral-400">({user.role})</span>
            </span>
            <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <FiBell size={20} className="text-neutral-600" />
            </button>
            <button
              onClick={() => navigate(`/${user.role}/profile`)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <FiUser size={20} className="text-neutral-600" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
            >
              <FiLogOut size={18} />
              <span className="text-p4">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-neutral-100 rounded-lg"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-neutral-200">
            <div className="flex flex-col gap-4 pt-4">
              <span className="text-p4 text-neutral-600 px-4">
                {user.fullName}
              </span>
              <button className="flex items-center gap-2 px-4 py-2 text-left hover:bg-neutral-50 rounded-lg w-full">
                <FiBell size={18} />
                <span className="text-p4">Notifications</span>
              </button>
              <button
                onClick={() => {
                  navigate(`/${user.role}/profile`);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-left hover:bg-neutral-50 rounded-lg w-full"
              >
                <FiUser size={18} />
                <span className="text-p4">Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-left text-secondary-600 hover:bg-secondary-50 rounded-lg w-full"
              >
                <FiLogOut size={18} />
                <span className="text-p4">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
