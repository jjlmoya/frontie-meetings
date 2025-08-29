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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'roboto-mono': ['Roboto Mono', 'monospace'],
        'dancing-script': ['Dancing Script', 'cursive'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      animation: {
        'wave': 'wave 2s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(3deg)' },
          '75%': { transform: 'rotate(-3deg)' },
        },
        glow: {
          'from': { textShadow: '0 0 20px currentColor' },
          'to': { textShadow: '0 0 30px currentColor, 0 0 40px currentColor' },
        }
      }
    },
  },
  plugins: [],
};
export default config;