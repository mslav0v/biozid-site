import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET - Вземане на ЕДНА конкретна заявка за преглед
export async function GET(
  request: Request,
  context: any // Използваме any, за да покрием изискванията на Next.js 15
) {
  try {
    // ЗАЩИТА: Разопаковаме параметрите с await
    const params = await context.params;
    const id = params.id;
    
    const quote = await prisma.quoteRequest.findUnique({
      where: { id },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Заявката не е намерена в базата' }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error: any) {
    console.error("ГРЕШКА ПРИ ЧЕТЕНЕ НА ЗАЯВКА:", error.message);
    return NextResponse.json({ error: 'Грешка при четене' }, { status: 500 });
  }
}

// 2. PATCH - Обновяване на статус или CAD данни
export async function PATCH(
  request: Request,
  context: any
) {
  try {
    const params = await context.params;
    const id = params.id;
    
    const body = await request.json();
    
    // Подготвяме обект с данните, които трябва да се обновят
    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.cadData) updateData.cadData = body.cadData;
    
    const updated = await prisma.quoteRequest.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("ГРЕШКА ПРИ СМЯНА НА ДАННИ:", error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}