import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';
import Input from '@/components/Input';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
}

export default function ManageSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: '1', name: 'ABC Publisher', email: 'abc@publisher.com', phone: '0123456789', address: '123 Main St', status: 'active' },
    { id: '2', name: 'XYZ Books', email: 'xyz@books.com', phone: '0987654321', address: '456 Oak Ave', status: 'active' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', email: '', phone: '', address: '' });

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

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAdd = () => {
    if (newSupplier.name && newSupplier.email) {
      setSuppliers([...suppliers, { id: Date.now().toString(), ...newSupplier, status: 'active' }]);
      setNewSupplier({ name: '', email: '', phone: '', address: '' });
      setIsAdding(false);
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
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-6 py-4 text-p4">{s.name}</td>
                      <td className="px-6 py-4 text-p4">{s.email}</td>
                      <td className="px-6 py-4 text-p4">{s.phone}</td>
                      <td className="px-6 py-4 text-p4">{s.address}</td>
                      <td className="px-6 py-4 text-p4"><span className="inline-flex items-center px-2 py-1 rounded text-tag-sm font-semibold bg-status-success-bg text-status-success">{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
  );
}
