import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/Layout';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { apiClient } from '@/utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError('Please enter email and password');
        setIsLoading(false);
        return;
      }

      console.log('Attempting login with:', email);
      const response = await apiClient.login(email, password);
      console.log('Login response:', response);
      
      // Extract user and token from response
      const { user, token } = response.data;
      
      if (!user || !token) {
        setError('Invalid server response');
        setIsLoading(false);
        return;
      }

      console.log('Login successful, user:', user);
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);

      // Redirect to appropriate dashboard
      const dashboardPaths = {
        admin: '/admin/dashboard',
        librarian: '/librarian/dashboard',
        assistant: '/librarian/dashboard',
        member: '/member/dashboard',
      };
      
      const dashboardPath = dashboardPaths[user.role as keyof typeof dashboardPaths] || '/';
      console.log('Redirecting to:', dashboardPath);

      navigate(dashboardPath);
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="card">
            <h1 className="text-h3 text-neutral-900 mb-2 text-center">Welcome</h1>
            <p className="text-p4 text-neutral-600 text-center mb-8">
              Sign in to your account
            </p>

            {error && (
              <div className="mb-6 p-4 bg-status-error-bg border border-status-error rounded-lg">
                <p className="text-p4 text-status-error">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <p className="text-p4 text-neutral-600 text-center">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary-600 font-semibold hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-status-info-bg border border-status-info rounded-lg">
            <p className="text-p5 text-status-info font-semibold mb-2">Demo Credentials:</p>
            <p className="text-p5 text-status-info">Admin: duchm@library.com / admin123</p>
            <p className="text-p5 text-status-info">Librarian: minhtv@library.com / (password)</p>
            <p className="text-p5 text-status-info">Assistant: lanlt@library.com / (password)</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
