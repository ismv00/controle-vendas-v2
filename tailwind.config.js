/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}', // 👈 ESSENCIAL
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        appbg: '#f7f6f3',
        surface: '#ffffff',
        'surface-subtle': '#fbfaf8',
        'surface-subtle-2': '#faf9f7',
        'fill-input': '#f2f0eb',
        'fill-chip': '#f4f2ed',
        'border-main': '#e8e5df',
        'border-input': '#e2dfd8',
        'border-row': '#f4f2ed',
        'border-divider': '#efece6',
        'border-divider-2': '#f2f0ea',
        ink: '#1a1917',
        'ink-2': '#5c5951',
        'ink-3': '#7c786f',
        'ink-4': '#8d897f',
        mute: '#9a968d',
        'mute-2': '#b6b2a9',
        placeholder: '#a8a49c',
        dark: '#151417',
        accent: {
          DEFAULT: '#4338ca',
          soft: 'rgba(67,56,202,.12)',
        },
        positive: {
          DEFAULT: '#1a7f52',
          soft: '#7ee2b0',
          bg: '#e8f3ec',
        },
        warn: {
          DEFAULT: '#96631c',
          2: '#b0742a',
          3: '#d98a3a',
          bg: '#fdf1e3',
        },
        negative: {
          DEFAULT: '#b03a2e',
          2: '#c0453a',
          bg: '#fbecea',
          border: '#f0dcd9',
        },
      },
      borderRadius: {
        chip: '7px',
        iconbtn: '9px',
        input: '10px',
        logo: '11px',
        block: '12px',
        card: '14px',
        hero: '16px',
        modal: '18px',
        pill: '99px',
      },
      boxShadow: {
        btn: '0 1px 2px rgba(0,0,0,.14)',
        'pill-active': '0 1px 2px rgba(0,0,0,.10)',
        modal: '0 24px 60px rgba(0,0,0,.28)',
      },
      keyframes: {
        vfIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'vf-in': 'vfIn 220ms ease',
        'vf-in-modal': 'vfIn 180ms ease',
      },
    },
  },
  plugins: [],
};
