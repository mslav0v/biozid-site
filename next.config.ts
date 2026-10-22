import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true, // Включва автоматична компресия за по-бързо зареждане
  poweredByHeader: false, // Скрива информацията за фреймуърка от потенциални хакерски ботове

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lawfhgcjxwzaywcz.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'app.trysoro.com', // За изображения от блога
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  async redirects() {
    return [
      {
        source: '/blog',
        has: [
          {
            type: 'query',
            key: 'post',
            value: '(?<slug>.*)',
          },
        ],
        destination: '/blog/:slug',
        permanent: true, // Това указва на Google да прехвърли целия SEO авторитет към новия адрес
      },
    ];
  },
};

export default nextConfig;