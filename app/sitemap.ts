// app/sitemap.ts
import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma'; // Уверете се, че пътят до Prisma клиента е правилен за вашия проект

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

  // 2. ДИНАМИЧНИ СТРАНИЦИ: МОДЕЛИ КЪЩИ (От Prisma)
  let houseRoutes: MetadataRoute.Sitemap = [];
  try {
    const houses = await prisma.house.findMany({
      // Извличаме slug за SEO адреса и updatedAt за датата на последна промяна
      select: { slug: true, id: true, updatedAt: true }
    });
    
    houseRoutes = houses.map((house) => ({
      // Ако по някаква причина slug липсва, ползваме id като резервен вариант
      url: `${baseUrl}/houses/${house.slug || house.id}`,
      lastModified: house.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Грешка при зареждане на къщи за sitemap:', error);
  }

  // 3. ДИНАМИЧНИ СТРАНИЦИ: БЛОГ СТАТИИ (От Prisma)
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    // Извличаме статиите директно от нашата база данни, където Make.com ги записва
    const posts = await prisma.blogPost.findMany({
      select: { slug: true, id: true, updatedAt: true }
    });

    blogRoutes = posts.map((post) => ({
      // SEO ФИКС: Подаваме адреса с ?post= към Google, за да съвпада със Soro скрипта
      url: `${baseUrl}/blog?post=${post.slug || post.id}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Грешка при зареждане на блог статии за sitemap:', error);
  }

  // Обединяваме всичко и го връщаме на Google
  return [...staticRoutes, ...houseRoutes, ...blogRoutes];
}