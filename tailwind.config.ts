import type { Config } from 'tailwindcss';

export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["dark", "light"],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
  },
} satisfies Config;
