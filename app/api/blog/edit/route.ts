import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET: Взимане на статия за формата за редактиране
export async function GET(req: Request) {
  try {
    // 1. ПРОВЕРКА ЗА СИГУРНОСТ (АВТЕНТИКАЦИЯ)
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Неоторизиран достъп' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Проверка дали сме получили валидно ID
    if (!id || id === 'undefined') {
      console.error("API Error: Липсващо или невалидно ID");
      return NextResponse.json({ error: 'Липсващо ID' }, { status: 400 });
    }

    const post = await prisma.blogPost.findUnique({
      where: { id: id },
    });

    if (!post) {
      console.error(`API Error: Статия с ID ${id} не е намерена`);
      return NextResponse.json({ error: 'Статията не съществува' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error("DATABASE CRITICAL ERROR:", error?.message || error);
    return NextResponse.json({ error: 'Връзката с базата данни пропадна' }, { status: 500 });
  }
}

// PUT: Записване на промените по статията
export async function PUT(req: Request) {
  try {
    // 1. ПРОВЕРКА ЗА СИГУРНОСТ (АВТЕНТИКАЦИЯ)
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Неоторизиран достъп' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, content, imageUrl } = body;

    if (!id) {
      return NextResponse.json({ error: 'Не може да се обнови статия без ID' }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json({ error: 'Заглавието и съдържанието са задължителни' }, { status: 400 });
    }

    // 2. ОБНОВЯВАНЕ В БАЗАТА ДАННИ
    const updated = await prisma.blogPost.update({
      where: { id: id },
      data: { 
        title: title.trim(), 
        content, 
        imageUrl,
        updatedAt: new Date() // Автоматично обновяваме датата на редакция
      },
    });

    console.log(`✅ Статия ${id} е обновена успешно.`);

    // 3. КРИТИЧНО ЗА SEO: МОМЕНТАЛНО ОПРЕСНЯВАНЕ НА КЕША (ON-DEMAND REVALIDATION)
    try {
      revalidatePath('/blog');
      revalidatePath(`/blog/${id}`);
      revalidatePath('/sitemap.xml');
    } catch (revalidateError) {
      console.warn('Предупреждение при обновяване на кеша (revalidatePath):', revalidateError);
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("UPDATE ERROR:", error?.message || error);
    return NextResponse.json({ error: 'Грешка при запис в базата данни' }, { status: 500 });
  }
}