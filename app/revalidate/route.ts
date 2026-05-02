// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Това е твоята тайна парола. Можеш да я смениш с каквато искаш.
  if (secret !== 'biozid-super-secret-123') {
    return NextResponse.json({ message: 'Грешна парола за достъп!' }, { status: 401 });
  }

  try {
    // Това е командата, която изчиства кеша на страницата с блога
    revalidatePath('/blog');
    
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(), 
      message: 'Кешът на блога беше изчистен успешно! Страницата вече е обновена.' 
    });
  } catch (err) {
    return NextResponse.json({ message: 'Грешка при изчистване на кеша' }, { status: 500 });
  }
}