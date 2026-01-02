import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi';

interface NavItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

interface SidebarProps {
  items: NavItem[];
}

export default function Sidebar({ items }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const location = useLocation();

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const isActive = (path?: string) => {
    return path && location.pathname.startsWith(path);
  };

  const renderNavItems = (items: NavItem[], isNestedList = false) => {
    return items.map((item, index) => (
      <div key={index}>
        {item.children ? (
          <button
            onClick={() => toggleMenu(item.label)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              openMenus.includes(item.label)
                ? 'bg-primary-50 text-primary-600'
                : 'text-neutral-700 hover:bg-neutral-100'
            } ${isNestedList ? 'text-p5' : 'text-p4'}`}
          >
            <span className="flex items-center gap-3">
              {item.icon}
              {item.label}
            </span>
            <FiChevronDown
              size={18}
              className={`transform transition-transform ${
                openMenus.includes(item.label) ? 'rotate-180' : ''
              }`}
            />
          </button>
        ) : (
          <Link
            to={item.path || '#'}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-primary-600 text-white'
                : 'text-neutral-700 hover:bg-neutral-100'
            } ${isNestedList ? 'text-p5' : 'text-p4'}`}
          >
            {item.icon}
            {item.label}
          </Link>
        )}
        {item.children && openMenus.includes(item.label) && (
          <div className="pl-4 space-y-1 mt-1">
            {renderNavItems(item.children, true)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 md:hidden z-40 p-3 bg-primary-600 text-white rounded-full shadow-lg"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen md:h-auto w-64 bg-white border-r border-neutral-200 overflow-y-auto transition-transform z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6">
          <h2 className="text-h6 font-bold text-neutral-900 mb-8">Menu</h2>
          <nav className="space-y-1">
            {renderNavItems(items)}
          </nav>
        </div>
      </aside>
    </>
  );
}
