import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/Layout';
import Button from '@/components/Button';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-h1 text-neutral-900 mb-6">
            Welcome to Library Management System
          </h1>
          <p className="text-p2 text-neutral-600 mb-12">
            A comprehensive solution for managing library operations, from book circulation to member management. Streamline your library services with our modern, intuitive platform.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button variant="primary" size="lg">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 -mx-4 px-4 md:py-32">
        <div className="container-main">
          <h2 className="text-h2 text-neutral-900 text-center mb-16">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-h5 text-neutral-900 mb-3">{feature.title}</h3>
                <p className="text-p4 text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 md:py-32">
        <div className="container-main">
          <h2 className="text-h2 text-neutral-900 text-center mb-16">Built for Everyone</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div key={index} className="card border-2 border-neutral-200">
                <div className="text-5xl mb-4">{role.icon}</div>
                <h3 className="text-h5 text-neutral-900 mb-4">{role.title}</h3>
                <ul className="space-y-3 mb-8">
                  {role.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary-600 font-bold text-lg">✓</span>
                      <span className="text-p4 text-neutral-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 bg-primary-600 text-white -mx-4 px-4 md:py-32">
          <div className="container-main text-center">
            <h2 className="text-h2 text-white mb-6">Ready to Get Started?</h2>
            <p className="text-p2 text-primary-50 mb-12 max-w-2xl mx-auto">
              Join our community and experience efficient library management. Sign up today to access all features.
            </p>
            <Link to="/register">
              <Button variant="secondary" size="lg">
                Create Your Account Now
              </Button>
            </Link>
          </div>
        </section>
      )}
    </Layout>
  );
}

const features = [
  {
    icon: '📚',
    title: 'Book Management',
    description: 'Efficiently manage your library catalog with advanced search and categorization capabilities.',
  },
  {
    icon: '👥',
    title: 'Member Portal',
    description: 'Allow members to search books, manage reservations, and pay fines online.',
  },
  {
    icon: '📊',
    title: 'Reports & Analytics',
    description: 'Gain insights into library operations with comprehensive reporting and analytics.',
  },
  {
    icon: '🔐',
    title: 'Role-Based Access',
    description: 'Secure system with different access levels for admins, librarians, and members.',
  },
  {
    icon: '🔔',
    title: 'Notifications',
    description: 'Keep members informed with timely notifications about due dates and reservations.',
  },
  {
    icon: '💳',
    title: 'Fine Management',
    description: 'Track and manage fines with an integrated payment system.',
  },
];

const roles = [
  {
    icon: '⚙️',
    title: 'Administrator',
    features: [
      'Manage staff accounts',
      'Oversee all operations',
      'Configure system settings',
      'View comprehensive reports',
      'Monitor audit logs',
    ],
  },
  {
    icon: '👨‍💼',
    title: 'Librarian',
    features: [
      'Process book circulation',
      'Manage reservations',
      'Handle member inquiries',
      'Track fines and payments',
      'Generate operational reports',
    ],
  },
  {
    icon: '👨‍💼',
    title: 'Member',
    features: [
      'Search and browse books',
      'Borrow and return books',
      'Reserve unavailable books',
      'Pay fines online',
      'Manage your profile',
    ],
  },
];
