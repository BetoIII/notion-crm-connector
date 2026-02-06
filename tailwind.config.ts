import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'wood-dark': 'hsl(var(--color-wood-dark))',
        'wood-medium': 'hsl(var(--color-wood-medium))',
        'wood-light': 'hsl(var(--color-wood-light))',
        'amber-glow': 'hsl(var(--color-amber-glow))',
        'amber-dim': 'hsl(var(--color-amber-dim))',
        'cream': 'hsl(var(--color-cream))',
        'tan': 'hsl(var(--color-tan))',
        'burnt-orange': 'hsl(var(--color-burnt-orange))',
        'olive': 'hsl(var(--color-olive))',
        'charcoal': 'hsl(var(--color-charcoal))',
        'smoke': 'hsl(var(--color-smoke))',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Courier Prime', 'Courier New', 'monospace'],
        body: ['var(--font-body)', 'IBM Plex Mono', 'Roboto Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'file-card-in': 'file-card-in 0.3s ease-out',
        'file-card-out': 'file-card-out 0.3s ease-in',
        'rotate-dial': 'rotate-dial 1s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px hsla(38, 92%, 58%, 0.3), 0 0 20px hsla(38, 92%, 58%, 0.2)' },
          '50%': { boxShadow: '0 0 20px hsla(38, 92%, 58%, 0.5), 0 0 30px hsla(38, 92%, 58%, 0.3)' },
        },
        'file-card-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'file-card-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        'rotate-dial': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
