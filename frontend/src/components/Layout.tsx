import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="container-main py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-neutral-200 mt-16">
        <div className="container-main py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-h6 text-neutral-900 mb-4">About LMS</h4>
              <p className="text-p4 text-neutral-600">
                A comprehensive library management system for efficient book circulation and member management.
              </p>
            </div>
            <div>
              <h4 className="text-h6 text-neutral-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-p4 text-primary-600 hover:underline">Home</Link></li>
                <li><Link to="/login" className="text-p4 text-primary-600 hover:underline">Login</Link></li>
                <li><Link to="/register" className="text-p4 text-primary-600 hover:underline">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-h6 text-neutral-900 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-p4 text-primary-600 hover:underline">Help Center</a></li>
                <li><a href="#" className="text-p4 text-primary-600 hover:underline">Contact Us</a></li>
                <li><a href="#" className="text-p4 text-primary-600 hover:underline">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-h6 text-neutral-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-p4 text-primary-600 hover:underline">Privacy Policy</a></li>
                <li><a href="#" className="text-p4 text-primary-600 hover:underline">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-200 pt-8">
            <p className="text-p5 text-neutral-500 text-center">
              © 2026 Library Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
