import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  // Указваме на Tailwind къде да търси нашите класове
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Тук дефинираме "Soro" стилистиката
      typography: {
        soro: {
          css: {
            '--tw-prose-body': '#1a1a1a',
            '--tw-prose-headings': '#111111',
            fontSize: '1.2rem',
            lineHeight: '1.8',
            maxWidth: '70ch', // Комфортна ширина за четене
            p: {
              marginTop: '1.5em',
              marginBottom: '1.5em',
            },
            'h1, h2, h3': {
              fontWeight: '700',
              letterSpacing: '-0.02em',
            },
            blockquote: {
              fontWeight: '400',
              fontStyle: 'italic',
              borderLeftWidth: '3px',
              borderLeftColor: '#000',
            },
          },
        },
      },
    },
  },
  plugins: [
    typography,
  ],
};

export default config;