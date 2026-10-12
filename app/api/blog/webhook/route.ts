import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Проверка за сигурност (използваме променлива от средата или подразбиращ се ключ)
    const secretKey = req.headers.get('x-webhook-secret');
    const expectedSecret = process.env.WEBHOOK_SECRET || 'super-taen-klyuch-biozid-2026';

    if (secretKey !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Взимане на данните, изпратени от Make.com / Soro
    const body = await req.json();
    const { title, content, excerpt, imageUrl } = body;

    // 3. Валидация на задължителните полета
    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields: title and content are mandatory' }, { status: 400 });
    }

    console.log("Получена нова статия от Webhook:", title);

    // 4. ЗАПИСВАНЕ В БАЗАТА ДАННИ (PRISMA)
    const newPost = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        content: content,
        excerpt: excerpt ? excerpt.trim() : '',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc',
        publishedAt: new Date(),
      }
    });

    // 5. КРИТИЧНО ЗА SEO: МОМЕНТАЛНО ОПРЕСНЯВАНЕ НА КЕША (ON-DEMAND REVALIDATION)
    try {
      revalidatePath('/blog');
      revalidatePath(`/blog/${newPost.id}`);
      revalidatePath('/sitemap.xml');
    } catch (revalidateError) {
      console.warn('Предупреждение при обновяване на кеша (revalidatePath):', revalidateError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Статията е публикувана успешно и кешът на блога е обновен!',
      postId: newPost.id 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Грешка при приемане на Webhook:", error?.message || error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}