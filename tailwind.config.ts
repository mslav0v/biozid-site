import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Стилистика за блог статиите и Soro съдържанието
      typography: {
        soro: {
          css: {
            '--tw-prose-body': '#334155', // slate-700
            '--tw-prose-headings': '#0f172a', // slate-900
            '--tw-prose-links': '#0f766e', // teal-700
            fontSize: '1rem',
            lineHeight: '1.75',
            maxWidth: '100%',
            '@media (min-width: 768px)': {
              fontSize: '1.125rem',
              lineHeight: '1.8',
            },
            p: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            'h1, h2, h3, h4': {
              color: '#0f172a',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              marginTop: '1.6em',
              marginBottom: '0.6em',
            },
            a: {
              color: '#0f766e',
              textDecoration: 'underline',
              fontWeight: '600',
              '&:hover': {
                color: '#115e59',
              },
            },
            blockquote: {
              fontWeight: '400',
              fontStyle: 'italic',
              borderLeftWidth: '4px',
              borderLeftColor: '#0f766e',
              paddingLeft: '1rem',
              color: '#475569',
            },
            img: {
              borderRadius: '0.75rem',
              marginTop: '2em',
              marginBottom: '2em',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            },
            hr: {
              borderColor: '#e2e8f0',
              marginTop: '3em',
              marginBottom: '3em',
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