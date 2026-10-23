// app/sitemap.ts
import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma'; 

export const dynamic = 'force-dynamic';

interface SoroArticle {
  title: string;
  slug: string;
  published_at?: string;
  description?: string;
}

// Помощна функция: Взимаме статиите директно от Soro, за да гарантираме правилните slugs
async function getSoroArticles(): Promise<SoroArticle[]> {
  try {
    const res = await fetch('https://app.trysoro.com/api/embed/9956916d-04d4-476a-afc4-0ab6bb82b06d', {
      next: { revalidate: 7200 }
    });
    const text = await res.text();
    const match = text.match(/var SORO_ARTICLES\s*=\s*(\[[\s\S]*?\]);/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
  } catch (error) {
    console.error('Грешка при зареждане на Soro статии за sitemap:', error);
  }
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://biozid.bg';

  // 1. СТАТИЧНИ СТРАНИЦИ
  const staticRoutes = [
    '',
    '/houses',
    '/technology',
    '/advantages',
    '/processes',
    '/calculator',
    '/blog',
    '/contacts'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. ДИНАМИЧНИ СТРАНИЦИ: МОДЕЛИ КЪЩИ (От Prisma)
  let houseRoutes: MetadataRoute.Sitemap = [];
  try {
    const houses = await prisma.house.findMany({
      select: { slug: true, id: true, updatedAt: true }
    });
    
    houseRoutes = houses.map((house) => ({
      url: `${baseUrl}/houses/${house.slug || house.id}`,
      lastModified: house.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Грешка при зареждане на къщи за sitemap:', error);
  }

  // 3. ДИНАМИЧНИ СТРАНИЦИ: БЛОГ СТАТИИ (От Soro)
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const soroArticles = await getSoroArticles();

    blogRoutes = soroArticles.map((article) => ({
      url: `${baseUrl}/blog?post=${article.slug}`,
      lastModified: article.published_at ? new Date(article.published_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Грешка при зареждане на блог статии за sitemap:', error);
  }

  return [...staticRoutes, ...houseRoutes, ...blogRoutes];
}