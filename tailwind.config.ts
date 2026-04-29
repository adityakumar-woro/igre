import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        bone: 'var(--bone)',
        sand: 'var(--sand)',
        ivory: 'var(--ivory)',
        gold: 'var(--gold)',
        amber: 'var(--amber)',
        sunset: 'var(--sunset)',
        rose: 'var(--rose)',
        gulf: 'var(--gulf)',
        tide: 'var(--tide)',
        sage: 'var(--sage)',
        mute: 'var(--mute)',
        line: 'var(--line)',
        success: 'var(--success)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-plex-arabic)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        editorial: '-0.02em',
        wide: '0.08em',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
