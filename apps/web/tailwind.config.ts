import type { Config } from 'tailwindcss';

export default {
  content: [],
  theme: {
    extend: {
      colors: {
        'result-win': '#4ade80',
        'result-loss': '#f87171',
        'result-ot': '#facc15',
      },
    },
  },
} satisfies Config;
