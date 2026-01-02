import Layout from '@/components/Layout';
import Button from '@/components/Button';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-h3 text-neutral-900 mb-4">Page Not Found</h2>
          <p className="text-p3 text-neutral-600 mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button variant="primary" size="lg">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
