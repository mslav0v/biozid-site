import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Инициализираме Prisma
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. Проверка за сигурност
    const secretKey = req.headers.get('x-webhook-secret');
    if (secretKey !== 'super-taen-klyuch-biozid-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Взимане на данните, изпратени от Make.com
    const body = await req.json();
    const { title, content, excerpt, imageUrl } = body;

    // 3. Валидация
    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log("Получена нова статия от Make.com:", title);

    // 4. ЗАПИСВАНЕ В БАЗАТА ДАННИ (PRISMA)
    const newPost = await prisma.blogPost.create({
      data: {
        title: title,
        content: content,
        excerpt: excerpt || '', // Ако няма кратко описание, запазваме празен низ
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc', // Снимка по подразбиране, ако Soro не върне такава
        publishedAt: new Date(),
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Статията е публикувана успешно!',
      postId: newPost.id 
    }, { status: 200 });

  } catch (error) {
    console.error("Грешка при приемане на Webhook:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}