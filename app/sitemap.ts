import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Задължаваме sitemap-а да се генерира динамично, за да хваща новите къщи и статии
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Главният URL на твоя сайт
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
    priority: route === '' ? 1.0 : 0.8, // Началната страница е с най-висок приоритет
  }));

  // 2. ДИНАМИЧНИ СТРАНИЦИ: МОДЕЛИ КЪЩИ
  let houseRoutes: MetadataRoute.Sitemap = [];
  try {
    const houses = await prisma.house.findMany({
      select: { id: true }
    });
    
    houseRoutes = houses.map((house) => ({
      url: `${baseUrl}/houses/${house.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.log('Грешка при зареждане на къщи за sitemap:', error);
  }

  // 3. ДИНАМИЧНИ СТРАНИЦИ: SORO БЛОГ СТАТИИ
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const soroRes = await fetch('https://app.trysoro.com/api/embed/c93c5a74-b1e7-4bbe-af5e-c74688e230f3', { cache: 'no-store' });
    const soroText = await soroRes.text();
    
    const match = soroText.match(/var SORO_ARTICLES\s*=\s*(\[[\s\S]*?\]);/);
    if (match && match[1]) {
      const articles = JSON.parse(match[1]);
      blogRoutes = articles.map((article: any) => ({
        url: `${baseUrl}/blog?post=${article.slug}`,
        // Ако Soro връща дата на публикуване, ползваме нея, иначе днешна дата
        lastModified: article.published_at ? new Date(article.published_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.log('Грешка при зареждане на Soro статии за sitemap:', error);
  }

  // Обединяваме всичко и го връщаме на Google
  return [...staticRoutes, ...houseRoutes, ...blogRoutes];
}