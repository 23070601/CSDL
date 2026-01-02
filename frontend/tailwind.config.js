/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors (Teal)
        primary: {
          50: '#E4FFFB',
          600: '#0B7C6B',
          700: '#0A6B5E',
        },
        // Secondary colors (Orange)
        secondary: {
          50: '#FFECE3',
          600: '#FF6320',
          700: '#E55A1A',
        },
        // Neutral colors
        neutral: {
          50: '#F9FCFB',
          100: '#F4F9F8',
          200: '#E4E9E8',
          300: '#E4E9E8',
          400: '#CCCCCC',
          500: '#848786',
          600: '#383A3A',
          700: '#383A3A',
          900: '#101313',
        },
        // Status colors
        status: {
          info: '#219FFF',
          'info-bg': '#E4F4FF',
          success: '#17BD8D',
          'success-bg': '#DFFEF5',
          warning: '#FFA114',
          'warning-bg': '#FFF1DC',
          error: '#FF4E3E',
          'error-bg': '#FFECEB',
        },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Heading styles
        h1: ['56px', { lineHeight: '66px', fontWeight: '700' }],
        h2: ['42px', { lineHeight: '52px', fontWeight: '700' }],
        h3: ['30px', { lineHeight: '40px', fontWeight: '700' }],
        h4: ['24px', { lineHeight: '34px', fontWeight: '700' }],
        h5: ['20px', { lineHeight: '30px', fontWeight: '700' }],
        h6: ['16px', { lineHeight: '22px', fontWeight: '700' }],
        // Paragraph styles
        p1: ['20px', { lineHeight: '30px', fontWeight: '400' }],
        p2: ['18px', { lineHeight: '28px', fontWeight: '400' }],
        p3: ['16px', { lineHeight: '26px', fontWeight: '400' }],
        p4: ['14px', { lineHeight: '22px', fontWeight: '400' }],
        p5: ['12px', { lineHeight: '20px', fontWeight: '400' }],
        // UI text styles
        'table-head-1': ['11px', { fontWeight: '500' }],
        'table-head-2': ['10px', { fontWeight: '500' }],
        'btn-lg': ['18px', { fontWeight: '600' }],
        'btn-md': ['14px', { fontWeight: '600' }],
        'btn-sm': ['13px', { fontWeight: '600' }],
        'tag-md': ['10px', { fontWeight: '600' }],
        'tag-sm': ['10px', { fontWeight: '600' }],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
