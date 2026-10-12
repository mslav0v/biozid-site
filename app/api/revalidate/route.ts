import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const path = searchParams.get('path') || '/blog';

    // Използваме променлива от средата REVALIDATE_SECRET или сигурен fallback
    const expectedSecret = process.env.REVALIDATE_SECRET || 'biozid-super-secret-123';

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, message: 'Грешна или липсваща парола за достъп!' },
        { status: 401 }
      );
    }

    // 1. Изчистваме кеша за желания адрес
    revalidatePath(path);

    // 2. Автоматично опресняваме и картата на сайта за търсачките
    if (path !== '/sitemap.xml') {
      revalidatePath('/sitemap.xml');
    }

    return NextResponse.json({ 
      success: true,
      revalidated: true, 
      path: path,
      now: Date.now(), 
      message: `Кешът за "${path}" беше изчистен успешно!` 
    });
  } catch (err: any) {
    console.error('Грешка при ревалидация:', err?.message || err);
    return NextResponse.json(
      { success: false, message: 'Грешка при изчистване на кеша' },
      { status: 500 }
    );
  }
}

// Разрешаваме извикване и през POST за външни Webhook системи
export async function POST(request: Request) {
  return GET(request);
}