/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx}', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '2rem',
        '2xl': '2rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        primary: '#606c38',
        'primary-dark': '#283618',
        background: '#fefae0',
        accent: '#dda15e',
        'accent-dark': '#bc6c25',
        surface: '#fffdf2',
        'surface-muted': '#f6f1d8',
        border: 'rgba(40, 54, 24, 0.12)',
        text: '#283618',
        'text-muted': 'rgba(40, 54, 24, 0.72)',
        danger: '#b84734',
      },
      fontFamily: {
        heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        card: '0 10px 30px -18px rgba(40, 54, 24, 0.35)',
        'card-hover': '0 18px 50px -24px rgba(40, 54, 24, 0.42)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
      },
      maxWidth: {
        'content-wide': '72rem',
        prose: '68ch',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at top, rgba(221, 161, 94, 0.22), transparent 48%)',
      },
    },
  },
  plugins: [],
}
