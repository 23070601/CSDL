import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Input from '@/components/Input';
import { apiClient } from '@/utils/api';

interface AuditLog {
  id?: string;
  LogID?: string;
  user?: string;
  user_id?: string;
  action?: string;
  Action?: string;
  timestamp?: string;
  Timestamp?: string;
  details?: string;
  Details?: string;
  TableName?: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

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

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAuditLogs({ limit: 100 });
      setLogs(response.data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(l => {
    const matchesSearch = 
      (l.user_id || l.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.Action || l.action || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Apply table filter
    if (tableFilter !== 'all' && (l.TableName || '').toLowerCase() !== tableFilter.toLowerCase()) {
      return false;
    }
    
    // Apply date filter
    const logDate = new Date(l.Timestamp || l.timestamp || '');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'today':
        return logDate >= today;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return logDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return logDate >= monthAgo;
      default:
        return true;
    }
  });

  // Get unique table names for filter dropdown
  const uniqueTables = ['all', ...new Set(logs.map(l => l.TableName || '').filter(Boolean))];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="md:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-h2 text-neutral-900 mb-8">Audit Logs</h1>
          <div className="card mb-6 space-y-4">
            <Input 
              label="Search" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search by user or action..." 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-p5 font-semibold text-neutral-900 mb-2">Filter by Table</label>
                <select
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-p4"
                >
                  {uniqueTables.map(table => (
                    <option key={table} value={table}>
                      {table === 'all' ? 'All Tables' : table}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-p5 font-semibold text-neutral-900 mb-2">Filter by Date</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-p4"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past 7 Days</option>
                  <option value="month">Past Month</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="px-6 py-4 text-left text-p5 font-semibold">User</th>
                  <th className="px-6 py-4 text-left text-p5 font-semibold">Action</th>
                  <th className="px-6 py-4 text-left text-p5 font-semibold">Table</th>
                  <th className="px-6 py-4 text-left text-p5 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 text-left text-p5 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr key={log.id || log.LogID} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-6 py-4 text-p4">{log.user_id || log.user || '-'}</td>
                      <td className="px-6 py-4 text-p4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-tag-sm font-semibold bg-primary-100 text-primary-700">
                          {log.Action || log.action || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-p4 text-neutral-600">{log.TableName || '-'}</td>
                      <td className="px-6 py-4 text-p4 text-neutral-600 text-sm">
                        {log.Timestamp || log.timestamp ? new Date(log.Timestamp || log.timestamp || '').toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-p4 text-neutral-600">{log.Details || log.details || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
