/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#1a2332',
        'brand-charcoal': '#2d3748',
        'brand-gold': '#d97706',
        'brand-gold-light': '#f59e0b',
        'brand-slate': '#64748b',
        'brand-gray-light': '#f3f4f6',
        'brand-gray-medium': '#9ca3af',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'lift': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      }
    }
  },
  plugins: [],
};
