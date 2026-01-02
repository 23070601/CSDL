# Frontend Quick Start Guide

## Overview

The Library Management System frontend is now ready to use! This guide will help you get started quickly.

## Prerequisites

Before you begin, make sure you have:
- **Node.js 16+** installed (download from https://nodejs.org/)
- **npm** or **yarn** package manager
- **Backend API** running on `http://localhost:3000`
- A code editor (VS Code recommended)

## Installation (5 minutes)

### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will download and install all required packages (~200MB).

### Step 3: Start Development Server
```bash
npm run dev
```

Output will show:
```
  VITE v5.0.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### Step 4: Open in Browser
- Visit `http://localhost:5173` in your web browser
- You should see the LMS home page

## First Login

The frontend expects a backend to be running. Here's how to test:

### Demo Credentials (when backend is ready)
```
Admin: admin@lms.com / password
Librarian: librarian@lms.com / password
Member: member@lms.com / password
```

## Project Structure Quick Reference

```
frontend/
├── src/
│   ├── components/      → Reusable UI components
│   ├── pages/          → Page components (organized by role)
│   ├── store/          → State management (auth)
│   ├── types/          → TypeScript definitions
│   ├── utils/          → API client & formatters
│   ├── App.tsx         → Main app with routing
│   └── index.css       → Global styles
├── package.json        → Dependencies & scripts
├── vite.config.ts      → Build configuration
└── tailwind.config.js  → Design system
```

## Available Commands

### Development
```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Check code quality
```

## Key Features Available Now

### ✅ Authentication
- Home page with feature overview
- Login page (`/login`)
- Registration page (`/register`)

### ✅ Admin Dashboard
- Navigate to `/admin/dashboard` after login (requires admin role)
- Menu with all admin features
- Stats overview

### ✅ Librarian Dashboard
- Navigate to `/librarian/dashboard` after login (requires librarian role)
- Circulation management menu
- Quick action buttons

### ✅ Member Dashboard
- Navigate to `/member/dashboard` after login (requires member role)
- Book search capabilities
- Loan and reservation tracking

## File Structure Overview

### Adding New Pages

1. Create page file in appropriate directory:
   ```bash
   src/pages/admin/MyNewPage.tsx
   ```

2. Add route in `src/App.tsx`:
   ```tsx
   <Route path="/admin/my-page" element={<ProtectedRoute role="admin" element={<MyNewPage />} />} />
   ```

3. Add to sidebar in that page component

### Adding New Components

1. Create component:
   ```bash
   src/components/MyComponent.tsx
   ```

2. Export from component and use in pages:
   ```tsx
   import MyComponent from '@/components/MyComponent';
   ```

## Customization

### Change Colors
Edit `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: { 600: '#0B7C6B' }  // Change primary color
    }
  }
}
```

### Change API URL
Edit `.env`:
```
VITE_API_URL=http://localhost:3000
```

### Add New Form Fields
Use existing components:
```tsx
<Input type="text" label="Name" placeholder="..." />
<Select label="Role" options={[...]} />
<TextArea label="Description" />
```

## Common Tasks

### Build for Production
```bash
npm run build
```
Creates optimized build in `dist/` folder

### Fix Linting Errors
```bash
npm run lint
```
Shows code quality issues

### Debug with DevTools
1. Open DevTools (F12 in browser)
2. Go to React DevTools tab
3. Inspect components and state

### Connect to Backend
- Ensure backend is running on `http://localhost:3000`
- API calls use `src/utils/api.ts`
- All endpoints are pre-configured

## Troubleshooting

### Port 5173 Already in Use
```bash
npm run dev -- --port 3001
```

### Dependencies Not Installing
```bash
rm -rf node_modules package-lock.json
npm install
```

### Module Not Found Error
- Check path aliases in `vite.config.ts`
- Verify file names match imports
- Clear browser cache (Ctrl+Shift+Del)

### API Connection Errors
- Verify backend is running on `http://localhost:3000`
- Check `.env` file has correct `VITE_API_URL`
- Check network tab in DevTools

### Page Won't Load
- Check browser console for errors (F12)
- Verify route exists in `App.tsx`
- Check ProtectedRoute permissions

## Code Quality

### TypeScript
- All code is fully typed
- Check types: `npx tsc --noEmit`

### ESLint
- Automatic code formatting
- Run: `npm run lint`

### Tailwind CSS
- All styling uses Tailwind
- No custom CSS files needed
- Color system defined in `tailwind.config.js`

## Performance Tips

1. **Code Splitting**: Routes are automatically split
2. **Image Optimization**: Use responsive images
3. **Bundle Size**: Check: `npm build && npm preview`
4. **Development**: Use React DevTools for debugging

## Next Development Steps

1. **Implement Book Search**
   - Add search form in `SearchBooks.tsx`
   - Connect to book API endpoints

2. **Build Circulation UI**
   - Create forms for borrow/return
   - Add transaction handling

3. **Add Reservation System**
   - Reservation list component
   - Booking interface

4. **Implement Fine Management**
   - Payment form
   - Fine calculation display

5. **Create Reporting**
   - Charts and statistics
   - Data export functionality

## Resources

- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **React Router**: https://reactrouter.com
- **Vite Docs**: https://vitejs.dev

## Support

When stuck:
1. Check browser console for errors (F12)
2. Review type definitions in `src/types/index.ts`
3. Check API client in `src/utils/api.ts`
4. Look at similar page implementations
5. Review backend API documentation

## Version Info

- **React**: 18.2.0
- **Vite**: 5.0.0
- **TypeScript**: 5.3.0
- **Tailwind CSS**: 3.3.0
- **Node.js Required**: 16+

## Getting Help

Issues checklist:
- [ ] Backend is running?
- [ ] Dependencies installed?
- [ ] `.env` file configured?
- [ ] Port 5173 available?
- [ ] Browser cache cleared?
- [ ] Node.js version correct?

---

**Happy Coding! 🚀**

For detailed information, see:
- `FRONTEND_PROJECT_SUMMARY.md` - Complete project overview
- `FRONTEND_FILES_MANIFEST.md` - File listing and statistics
- `frontend/README.md` - In-depth documentation
