import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  public async login(email: string, password: string) {
    // Try to login with different roles
    const roles = ['Admin', 'Librarian', 'Assistant', 'Member'];
    let lastError: any;

    for (const role of roles) {
      try {
        return await this.client.post('/api/auth/login', { email, password, role });
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }

  public register(data: Record<string, any>) {
    return this.client.post('/api/auth/register', data);
  }

  public logout() {
    return this.client.post('/api/auth/logout');
  }

  public getCurrentUser() {
    return this.client.get('/auth/me');
  }

  // Books endpoints
  public getBooks(params?: Record<string, any>) {
    return this.client.get('/api/books', { params });
  }

  public getBook(id: string) {
    return this.client.get(`/api/books/${id}`);
  }

  public createBook(data: Record<string, any>) {
    return this.client.post('/api/books', data);
  }

  public updateBook(id: string, data: Record<string, any>) {
    return this.client.put(`/api/books/${id}`, data);
  }

  public deleteBook(id: string) {
    return this.client.delete(`/api/books/${id}`);
  }

  // Loans endpoints
  public getLoans(params?: Record<string, any>) {
    return this.client.get('/api/loans', { params });
  }

  public getLoan(id: string) {
    return this.client.get(`/api/loans/${id}`);
  }

  public borrowBook(data: Record<string, any>) {
    return this.client.post('/api/loans', data);
  }

  public returnBook(id: string) {
    return this.client.post(`/api/loans/${id}/return`);
  }

  public renewLoan(id: string) {
    return this.client.post(`/api/loans/${id}/renew`);
  }

  // Reservations endpoints
  public getReservations(params?: Record<string, any>) {
    return this.client.get('/api/reservations', { params });
  }

  public createReservation(data: Record<string, any>) {
    return this.client.post('/api/reservations', data);
  }

  public cancelReservation(id: string) {
    return this.client.delete(`/api/reservations/${id}`);
  }

  // Fines endpoints
  public getFines(params?: Record<string, any>) {
    return this.client.get('/api/fines', { params });
  }

  public payFine(id: string, data: Record<string, any>) {
    return this.client.post(`/api/fines/${id}/pay`, data);
  }

  // Members endpoints
  public getMembers(params?: Record<string, any>) {
    return this.client.get('/api/members', { params });
  }

  public getMember(id: string) {
    return this.client.get(`/api/members/${id}`);
  }

  public updateMember(id: string, data: Record<string, any>) {
    return this.client.put(`/api/members/${id}`, data);
  }

  // Staff endpoints
  public getStaff(params?: Record<string, any>) {
    return this.client.get('/api/staff', { params });
  }

  public getStaffById(id: string) {
    return this.client.get(`/api/staff/${id}`);
  }

  public createStaff(data: Record<string, any>) {
    return this.client.post('/api/staff', data);
  }

  public updateStaff(id: string, data: Record<string, any>) {
    return this.client.put(`/api/staff/${id}`, data);
  }

  public deleteStaff(id: string) {
    return this.client.delete(`/api/staff/${id}`);
  }

  // Suppliers endpoints
  public getSuppliers(params?: Record<string, any>) {
    return this.client.get('/api/suppliers', { params });
  }

  public createSupplier(data: Record<string, any>) {
    return this.client.post('/api/suppliers', data);
  }

  public updateSupplier(id: string, data: Record<string, any>) {
    return this.client.put(`/api/suppliers/${id}`, data);
  }

  public deleteSupplier(id: string) {
    return this.client.delete(`/api/suppliers/${id}`);
  }

  // Purchase Orders endpoints
  public getPurchaseOrders(params?: Record<string, any>) {
    return this.client.get('/api/purchase-orders', { params });
  }

  public createPurchaseOrder(data: Record<string, any>) {
    return this.client.post('/api/purchase-orders', data);
  }

  public updatePurchaseOrder(id: string, data: Record<string, any>) {
    return this.client.put(`/api/purchase-orders/${id}`, data);
  }

  public deletePurchaseOrder(id: string) {
    return this.client.delete(`/api/purchase-orders/${id}`);
  }

  // Reports endpoints
  public getReports(params?: Record<string, any>) {
    return this.client.get('/api/reports', { params });
  }

  public generateReport(type: string, params?: Record<string, any>) {
    return this.client.get(`/api/reports/generate/${type}`, { params });
  }

  // Audit Log endpoints
  public getAuditLogs(params?: Record<string, any>) {
    return this.client.get('/api/audit-logs', { params });
  }

  // Notifications endpoints
  public getNotifications(params?: Record<string, any>) {
    return this.client.get('/api/notifications', { params });
  }

  public markNotificationAsRead(id: string) {
    return this.client.put(`/api/notifications/${id}/read`);
  }

  // System Config endpoints
  public getConfig() {
    return this.client.get('/api/config');
  }

  public updateConfig(data: Record<string, any>) {
    return this.client.put('/api/config', data);
  }
}

export const apiClient = new ApiClient();
