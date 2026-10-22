// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://vashiqt-domain.bg' // ВЪВЕДЕТЕ ВАШИЯ РЕАЛЕН ДОМЕЙН ТУК

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Забраняваме на Googlebot да сканира админ панела, логин страницата и вътрешните API-та
      disallow: ['/admin/', '/login/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}