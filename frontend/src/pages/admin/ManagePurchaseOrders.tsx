import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { apiClient } from '@/utils/api';

interface Order {
  id?: string;
  supplier?: string;
  amount?: number;
  date?: string;
  status?: 'pending' | 'processing' | 'approved' | 'completed' | 'cancelled' | 'received';
  POID?: string;
  SupplierID?: string;
  SupplierName?: string;
  StaffID?: string;
  OrderDate?: string;
  ExpectedDate?: string;
  Status?: string;
  Amount?: number;
}

interface Supplier {
  SupplierID: string;
  Name: string;
}

export default function ManagePurchaseOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'approved' | 'completed' | 'cancelled'>('all');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [isAddingNewSupplier, setIsAddingNewSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    SupplierID: '',
    Name: '',
    Contact: '',
    Email: '',
    Phone: '',
    Address: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
  }, []);

  const generatePOID = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PO${timestamp}${random}`;
  };

  const generateSupplierID = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `SUP${timestamp}${random}`;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPurchaseOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await apiClient.getSuppliers();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]);
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

  const filtered = orders.filter(o => {
    const matchesSearch = (o.supplier || o.SupplierName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (o.Status || o.status || '').toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddOrder = async () => {
    if (editingOrder) {
      try {
        const newPOID = generatePOID();
        await apiClient.createPurchaseOrder({
          POID: newPOID,
          SupplierID: editingOrder.SupplierID,
          OrderDate: editingOrder.OrderDate || new Date().toISOString().split('T')[0],
          ExpectedDate: editingOrder.ExpectedDate,
          Status: editingOrder.Status || 'pending',
        });
        
        await fetchOrders();
        setEditingOrder(null);
        setIsAddingOrder(false);
        alert('Purchase order created successfully!');
      } catch (error) {
        console.error('Error creating order:', error);
        alert('Failed to create order. Please try again.');
      }
    }
  };

  const handleEditOrder = async () => {
    if (editingOrder) {
      try {
        await apiClient.updatePurchaseOrder(editingOrder.id || editingOrder.POID || '', {
          SupplierID: editingOrder.SupplierID,
          OrderDate: editingOrder.OrderDate,
          ExpectedDate: editingOrder.ExpectedDate,
          Status: editingOrder.Status || editingOrder.status,
        });
        
        await fetchOrders();
        setEditingOrder(null);
        alert('Purchase order updated successfully!');
      } catch (error) {
        console.error('Error updating order:', error);
        alert('Failed to update order. Please try again.');
      }
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await apiClient.deletePurchaseOrder(orderId);
        await fetchOrders();
        alert('Purchase order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order. Please try again.');
      }
    }
  };

  const handleAddNewSupplier = async () => {
    if (!newSupplier.Name) {
      alert('Please enter a supplier name');
      return;
    }

    try {
      const supplierID = generateSupplierID();
      await apiClient.createSupplier({
        SupplierID: supplierID,
        Name: newSupplier.Name,
        Contact: newSupplier.Contact,
        Email: newSupplier.Email,
        Phone: newSupplier.Phone,
        Address: newSupplier.Address,
      });
      
      await fetchSuppliers();
      setEditingOrder({ ...editingOrder, SupplierID: supplierID });
      setIsAddingNewSupplier(false);
      setNewSupplier({ SupplierID: '', Name: '', Contact: '', Email: '', Phone: '', Address: '' });
      alert('Supplier added successfully!');
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert('Failed to add supplier. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="md:ml-64 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">Manage Purchase Orders</h1>

            {editingOrder && (
              <div className="card mb-6 p-6">
                <h3 className="text-h5 text-neutral-900 mb-4">
                  {isAddingOrder ? 'Add Purchase Order' : 'Edit Purchase Order'}
                </h3>
                <div className="space-y-4">
                  {!isAddingOrder && (
                    <div>
                      <label className="block text-p4 font-semibold text-neutral-900 mb-2">Order ID</label>
                      <p className="text-p4 text-neutral-600">{editingOrder.id || editingOrder.POID}</p>
                    </div>
                  )}
                  <Select
                    label="Supplier"
                    value={editingOrder.SupplierID || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, SupplierID: e.target.value })}
                    options={[
                      { value: '', label: 'Select a supplier' },
                      ...suppliers.map(s => ({ value: s.SupplierID, label: s.Name }))
                    ]}
                  />
                  
                  {!isAddingNewSupplier ? (
                    <button
                      onClick={() => setIsAddingNewSupplier(true)}
                      className="text-primary-600 hover:underline text-sm font-semibold"
                    >
                      + Add New Supplier
                    </button>
                  ) : (
                    <div className="border border-primary-200 bg-primary-50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-p4 font-semibold text-neutral-900">New Supplier Details</h4>
                        <button
                          onClick={() => setIsAddingNewSupplier(false)}
                          className="text-neutral-500 hover:text-neutral-700"
                        >
                          ✕
                        </button>
                      </div>
                      <Input
                        label="Supplier Name *"
                        value={newSupplier.Name}
                        onChange={(e) => setNewSupplier({ ...newSupplier, Name: e.target.value })}
                        placeholder="Enter supplier name"
                      />
                      <Input
                        label="Contact Person"
                        value={newSupplier.Contact}
                        onChange={(e) => setNewSupplier({ ...newSupplier, Contact: e.target.value })}
                        placeholder="Enter contact person name"
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={newSupplier.Email}
                        onChange={(e) => setNewSupplier({ ...newSupplier, Email: e.target.value })}
                        placeholder="Enter email address"
                      />
                      <Input
                        label="Phone"
                        value={newSupplier.Phone}
                        onChange={(e) => setNewSupplier({ ...newSupplier, Phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                      <Input
                        label="Address"
                        value={newSupplier.Address}
                        onChange={(e) => setNewSupplier({ ...newSupplier, Address: e.target.value })}
                        placeholder="Enter address"
                      />
                      <Button onClick={handleAddNewSupplier} variant="primary" className="w-full">
                        Add Supplier
                      </Button>
                    </div>
                  )}
                  
                  <Input
                    label="Order Date"
                    type="date"
                    value={editingOrder.OrderDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEditingOrder({ ...editingOrder, OrderDate: e.target.value })}
                  />
                  <Input
                    label="Expected Date"
                    type="date"
                    value={editingOrder.ExpectedDate || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, ExpectedDate: e.target.value })}
                  />
                  <Select
                    label="Status"
                    value={editingOrder.Status || editingOrder.status || 'pending'}
                    onChange={(e) => setEditingOrder({ ...editingOrder, Status: e.target.value, status: e.target.value as 'pending' | 'processing' | 'approved' | 'completed' | 'cancelled' })}
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'processing', label: 'Processing' },
                      { value: 'approved', label: 'Approved' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'cancelled', label: 'Cancelled' }
                    ]}
                  />
                  <div className="flex gap-2">
                    <Button onClick={isAddingOrder ? handleAddOrder : handleEditOrder} variant="primary">
                      {isAddingOrder ? 'Create Order' : 'Save Changes'}
                    </Button>
                    <Button onClick={() => { setEditingOrder(null); setIsAddingOrder(false); }} variant="secondary">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="card mb-6 p-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input 
                    label="" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="Search orders..." 
                  />
                </div>
                <Button 
                  onClick={() => {
                    setIsAddingOrder(true);
                    setEditingOrder({ Status: 'pending', OrderDate: new Date().toISOString().split('T')[0] });
                  }} 
                  variant="primary"
                >
                  + Add Purchase Order
                </Button>
              </div>
              <div>
                <label className="block text-p5 font-semibold text-neutral-900 mb-2">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'processing' | 'approved' | 'completed' | 'cancelled')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-p4"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Order ID</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Supplier</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Amount</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Date</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                        Loading orders...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((o) => (
                      <tr key={o.id || o.POID} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-6 py-4 text-p4">{o.id || o.POID}</td>
                        <td className="px-6 py-4 text-p4">{o.supplier || o.SupplierName}</td>
                        <td className="px-6 py-4 text-p4 font-semibold">${((o.Amount ?? o.amount) ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-p4">{o.date ? new Date(o.date).toLocaleDateString() : new Date(o.OrderDate || '').toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-p4">
                          <button
                            onClick={() => {
                              setEditingOrder(o);
                              setIsAddingOrder(false);
                            }}
                            className={`inline-flex items-center px-2 py-1 rounded text-tag-sm font-semibold cursor-pointer transition-all hover:shadow-md ${
                              (o.status || o.Status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 
                              (o.status || o.Status || '').toLowerCase() === 'approved' || (o.status || o.Status || '').toLowerCase() === 'processing' ? 'bg-primary-100 text-primary-700 hover:bg-primary-200' : 
                              'bg-status-success-bg text-status-success hover:bg-green-200'
                            }`}
                            title="Click to edit status"
                          >
                            {o.status || o.Status}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-p4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setEditingOrder(o);
                                setIsAddingOrder(false);
                              }}
                              className="text-primary-600 hover:underline font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(o.id || o.POID || '')}
                              className="text-red-600 hover:underline font-semibold"
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
          </div>
        </main>
      </div>
  );
}
