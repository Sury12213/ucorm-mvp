import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8f9ff',
        primary: '#004ac6',
        'primary-container': '#2563eb',
        'primary-fixed': '#dbe1ff',
        'on-primary': '#ffffff',
        'on-primary-fixed': '#00174b',
        surface: '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'surface-variant': '#d3e4fe',
        'on-background': '#0b1c30',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#434655',
        outline: '#737686',
        'outline-variant': '#c3c6d7',
        secondary: '#495c95',
        'secondary-fixed': '#dbe1ff',
        'on-secondary-fixed': '#00174b',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
      },
      fontFamily: {
        display: ['Hanken Grotesk', 'sans-serif'],
        headline: ['Hanken Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
      },
      spacing: {
        gutter: '24px',
      },
    },
  },
  plugins: [],
};

export default config;
