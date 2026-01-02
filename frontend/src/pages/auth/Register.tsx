import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import { apiClient } from '@/utils/api';

// Password validation requirements
const passwordRequirements = [
  { label: 'At least 8 characters', regex: /.{8,}/ },
  { label: 'At least one uppercase letter', regex: /[A-Z]/ },
  { label: 'At least one lowercase letter', regex: /[a-z]/ },
  { label: 'At least one number', regex: /[0-9]/ },
  { label: 'At least one special character (!@#$%^&*)', regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ },
];

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    memberType: 'Standard',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const navigate = useNavigate();

  const checkPasswordRequirements = (password: string) => {
    return passwordRequirements.map(req => ({
      ...req,
      met: req.regex.test(password)
    }));
  };

  const isPasswordValid = (password: string) => {
    return checkPasswordRequirements(password).every(req => req.met);
  };

  const passwordStatus = checkPasswordRequirements(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!isPasswordValid(formData.password)) {
      setError('Password does not meet requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        memberType: formData.memberType,
      });

      navigate('/login?message=Registration successful. Please sign in.');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="card">
            <h1 className="text-h3 text-neutral-900 mb-2 text-center">Create Account</h1>
            <p className="text-p4 text-neutral-600 text-center mb-8">
              Join our library community
            </p>

            {error && (
              <div className="mb-6 p-4 bg-status-error-bg border border-status-error rounded-lg">
                <p className="text-p4 text-status-error">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="text"
                name="fullName"
                label="Full Name"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <Input
                type="email"
                name="email"
                label="Email Address"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Select
                name="memberType"
                label="Account Type"
                value={formData.memberType}
                onChange={handleChange}
                options={[
                  { value: 'Standard', label: 'Standard Member' },
                  { value: 'Premium', label: 'Premium Member' },
                  { value: 'Student', label: 'Student' },
                ]}
              />
              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setShowPasswordRequirements(true)}
                onBlur={() => setShowPasswordRequirements(false)}
                required
              />
              
              {(showPasswordRequirements || formData.password) && (
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <p className="text-sm font-semibold text-neutral-900 mb-3">Password Requirements:</p>
                  <ul className="space-y-2">
                    {passwordStatus.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className={`text-sm ${req.met ? 'text-green-600' : 'text-neutral-400'}`}>
                          {req.met ? '✓' : '○'}
                        </span>
                        <span className={`text-sm ${req.met ? 'text-neutral-700' : 'text-neutral-500'}`}>
                          {req.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <p className="text-p4 text-neutral-600 text-center">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
