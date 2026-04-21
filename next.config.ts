import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Казваме на Next.js да генерира статични HTML/CSS/JS файлове
  output: 'export',
  
  // Изключваме сървърната оптимизация на изображенията
  images: {
    unoptimized: true,
  },
};

export default nextConfig;