import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { apiClient } from '@/utils/api';

interface Supplier {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status?: 'active' | 'inactive';
  SupplierID?: string;
  Name?: string;
  Email?: string;
}

export default function ManageSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSuppliers();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]);
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

  const filtered = suppliers.filter(s => (s.name || s.Name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAdd = async () => {
    if (newSupplier.name && newSupplier.email) {
      try {
        const response = await apiClient.createSupplier({
          Name: newSupplier.name,
          Email: newSupplier.email,
          Phone: newSupplier.phone || null,
          Address: newSupplier.address || null,
        });
        
        const newSupplierData = {
          id: response.data?.SupplierID || Date.now().toString(),
          name: response.data?.Name || newSupplier.name,
          email: response.data?.Email || newSupplier.email,
          phone: response.data?.Phone || newSupplier.phone,
          address: response.data?.Address || newSupplier.address,
          status: 'active' as const,
        };
        
        setSuppliers([...suppliers, newSupplierData]);
        setNewSupplier({ name: '', email: '', phone: '', address: '' });
        setIsAdding(false);
      } catch (error) {
        console.error('Error creating supplier:', error);
        alert('Failed to create supplier. Please try again.');
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
              <h1 className="text-h2 text-neutral-900">Manage Suppliers</h1>
              <Button onClick={() => setIsAdding(!isAdding)} variant="primary">{isAdding ? 'Cancel' : '+ Add Supplier'}</Button>
            </div>

            {isAdding && (
              <div className="card mb-6 p-6">
                <div className="space-y-4">
                  <Input label="Name" value={newSupplier.name} onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})} />
                  <Input label="Email" type="email" value={newSupplier.email} onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})} />
                  <Input label="Phone" value={newSupplier.phone} onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})} />
                  <Input label="Address" value={newSupplier.address} onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})} />
                  <Button onClick={handleAdd} variant="primary">Add Supplier</Button>
                </div>
              </div>
            )}

            <div className="card mb-6">
              <Input label="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search suppliers..." />
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Phone</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Address</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                        Loading suppliers...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                        No suppliers found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr key={s.id || s.SupplierID} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-6 py-4 text-p4">{s.name || s.Name}</td>
                        <td className="px-6 py-4 text-p4">{s.email || s.Email}</td>
                        <td className="px-6 py-4 text-p4">{s.phone || '-'}</td>
                        <td className="px-6 py-4 text-p4">{s.address || '-'}</td>
                        <td className="px-6 py-4 text-p4"><span className="inline-flex items-center px-2 py-1 rounded text-tag-sm font-semibold bg-status-success-bg text-status-success">{s.status || 'active'}</span></td>
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
