import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET: Извличане на единична къща по ID
export async function GET(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Липсващо ID' }, { status: 400 });
    }

    const house = await prisma.house.findUnique({
      where: { id },
    });

    if (!house) {
      return NextResponse.json({ error: 'Къщата не е намерена' }, { status: 404 });
    }

    return NextResponse.json(house);
  } catch (error: any) {
    console.error("Грешка при извличане на къща:", error?.message || error);
    return NextResponse.json({ error: "Грешка при зареждане на данните" }, { status: 500 });
  }
}

// PUT: Редактиране на съществуваща къща (Защитено с автентикация)
export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. ПРОВЕРКА за административна сесия
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Неоторизиран достъп' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Липсващо ID' }, { status: 400 });
    }

    // Премахваме служебните и системните полета от данните, за да не възникне грешка в Prisma
    const { id: _, createdAt: __, updatedAt: ___, ...updateData } = data;

    // 2. Обновяване в базата данни
    const house = await prisma.house.update({
      where: { id },
      data: updateData,
    });

    // 3. КРИТИЧНО ЗА SEO: Автоматично опресняване на кеша
    try {
      revalidatePath('/houses');
      revalidatePath(`/houses/${id}`);
      revalidatePath('/');
      revalidatePath('/sitemap.xml');
    } catch (revalidateError) {
      console.warn('Предупреждение при обновяване на кеша:', revalidateError);
    }

    return NextResponse.json(house);
  } catch (error: any) {
    console.error("Грешка при обновление на къща:", error?.message || error);
    return NextResponse.json({ error: "Грешка при обновление на данните" }, { status: 500 });
  }
}

// DELETE: Изтриване на къща (Защитено с автентикация)
export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. ПРОВЕРКА за административна сесия
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Неоторизиран достъп' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Липсващо ID' }, { status: 400 });
    }

    // 2. Изтриване от базата данни
    await prisma.house.delete({ 
      where: { id } 
    });

    // 3. КРИТИЧНО ЗА SEO: Автоматично опресняване на кеша
    try {
      revalidatePath('/houses');
      revalidatePath(`/houses/${id}`);
      revalidatePath('/');
      revalidatePath('/sitemap.xml');
    } catch (revalidateError) {
      console.warn('Предупреждение при обновяване на кеша:', revalidateError);
    }

    return NextResponse.json({ success: true, message: "Моделът къща е изтрит успешно" });
  } catch (error: any) {
    console.error("Грешка при изтриване на къща:", error?.message || error);
    return NextResponse.json({ error: "Грешка при изтриване на модела" }, { status: 500 });
  }
}