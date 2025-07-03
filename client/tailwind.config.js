module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          600: '#4F46E5',
        },
        sky: {
          500: '#0EA5E9',
        },
        emerald: {
          500: '#10B981',
        },
        rose: {
          500: '#F43F5E',
        },
        gray: {
          50: '#F9FAFB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}; 