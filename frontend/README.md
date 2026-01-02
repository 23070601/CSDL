# Library Management System - Frontend

React-based frontend for the Library Management System (LMS), built with modern web technologies.

## Features

- **Role-Based Access Control**: Admin, Librarian, and Member dashboards
- **Authentication**: Secure login and registration with JWT tokens
- **Book Management**: Search, browse, and manage library books
- **Circulation**: Handle book borrowing, returns, and renewals
- **Reservations**: Reserve books and manage waiting lists
- **Fine Management**: Track and pay fines
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, intuitive interface following design system guidelines

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router
- **Icons**: React Icons

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   ├── Select.tsx
│   ├── Sidebar.tsx
│   └── TextArea.tsx
├── pages/              # Page components
│   ├── admin/         # Admin dashboard pages
│   ├── librarian/     # Librarian dashboard pages
│   ├── member/        # Member dashboard pages
│   ├── auth/          # Authentication pages
│   ├── Home.tsx       # Home page
│   └── NotFound.tsx   # 404 page
├── store/             # State management (Zustand)
│   └── authStore.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── utils/             # Utility functions
│   ├── api.ts         # API client
│   └── formatters.ts  # Formatter utilities
├── App.tsx            # Main app component
├── main.tsx           # Entry point
├── index.css          # Global styles with Tailwind
└── vite-env.d.ts      # Vite environment variables

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Update API URL in `.env`:
   ```
   VITE_API_URL=http://localhost:3000
   ```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

### Preview

Preview the production build:

```bash
npm run preview
```

## UI Design System

The frontend follows a modern, clean design system with:

- **Primary Color**: #0B7C6B (Teal)
- **Secondary Color**: #FF6320 (Orange)
- **Typography**: Sora font family
- **Components**: Card-based, responsive grid layout
- **Status Colors**: Success, Warning, Error, Info states

## API Integration

The frontend connects to the backend API at the configured `VITE_API_URL`. 

### Authentication

- Login endpoint: `POST /auth/login`
- Register endpoint: `POST /auth/register`
- Tokens are stored in localStorage and sent with each request

### Available Endpoints

- `/books` - Book management
- `/loans` - Loan operations
- `/reservations` - Reservation management
- `/fines` - Fine tracking
- `/members` - Member management
- `/staff` - Staff management (Admin only)
- `/suppliers` - Supplier management (Admin only)
- `/purchase-orders` - Purchase order management (Admin only)
- `/reports` - Reports and analytics
- `/audit-logs` - System audit logs (Admin only)

## Features Implementation Status

### Completed
- ✅ Project setup with Vite and TypeScript
- ✅ Tailwind CSS integration
- ✅ Type definitions
- ✅ Authentication pages (Login, Register)
- ✅ Home page with feature overview
- ✅ Navigation components (Navbar, Sidebar)
- ✅ Dashboard layouts for all roles
- ✅ Reusable form components
- ✅ API client setup
- ✅ Protected routes

### In Progress
- 📋 Admin dashboard features
- 📋 Librarian dashboard features
- 📋 Member dashboard features

### Coming Soon
- ⏳ Book search and browse interface
- ⏳ Circulation management (borrow/return)
- ⏳ Reservation system
- ⏳ Fine payment system
- ⏳ Notifications system
- ⏳ Reports and analytics
- ⏳ File upload for book covers

## Contributing

When adding new features:

1. Create pages in appropriate role folder (`admin/`, `librarian/`, or `member/`)
2. Use existing components from `src/components/`
3. Maintain consistent styling with Tailwind CSS
4. Add TypeScript types for all data structures
5. Use the API client from `src/utils/api.ts`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

The frontend is optimized for performance:

- Lazy loading of routes
- Code splitting with Vite
- Optimized bundle size
- Responsive image handling
- Efficient state management with Zustand

## Security

- Protected routes with role-based access control
- JWT token-based authentication
- Secure token storage and refresh handling
- CORS-enabled API communication
- Input validation on all forms

## License

This project is part of a Database and Information Systems course.

## Support

For issues or questions, contact the development team or refer to the project documentation.
