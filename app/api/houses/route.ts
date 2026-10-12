import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Извличане на всички модели къщи
export async function GET() {
  try {
    const houses = await prisma.house.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
    return NextResponse.json(houses);
  } catch (error: any) {
    console.error("Грешка при извличане на къщи:", error?.message || error);
    return NextResponse.json(
      { error: "Грешка при зареждане на моделите къщи" }, 
      { status: 500 }
    );
  }
}

// POST: Създаване на нов модел къща (Защитено с автентикация)
export async function POST(req: Request) {
  try {
    // 1. ПРОВЕРКА за административна сесия
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Неоторизиран достъп' }, { status: 401 });
    }

    const data = await req.json();

    // 2. Валидация на базовите данни
    if (!data || !data.name) {
      return NextResponse.json(
        { error: 'Името на модела къща е задължително' }, 
        { status: 400 }
      );
    }

    // 3. Записване в базата данни
    const house = await prisma.house.create({ data });

    // 4. КРИТИЧНО ЗА SEO: Автоматично опресняване на кеша за страницата с къщи и sitemap
    try {
      revalidatePath('/houses');
      revalidatePath('/');
      revalidatePath('/sitemap.xml');
    } catch (revalidateError) {
      console.warn('Предупреждение при обновяване на кеша:', revalidateError);
    }

    return NextResponse.json(house, { status: 201 });
  } catch (error: any) {
    console.error("Грешка при запис на къща:", error?.message || error);
    return NextResponse.json({ error: "Грешка при запис в базата данни" }, { status: 500 });
  }
}