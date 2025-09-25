import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        card: 'hsl(0 0% 100%)',
        'card-foreground': 'hsl(222 47% 11%)',
        muted: 'hsl(210 40% 96.1%)',
        border: 'hsl(214 32% 91%)',
      },
    },
  },
  plugins: [],
} satisfies Config
