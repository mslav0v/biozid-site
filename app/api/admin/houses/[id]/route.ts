import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET - Вземане на данни за една конкретна къща (за формата за редакция)
export async function GET(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // Защита за Next.js 15+
) {
  try {
    const { id } = await params;
    const house = await prisma.house.findUnique({ where: { id } });
    
    if (!house) return NextResponse.json({ error: "Къщата не е намерена" }, { status: 404 });
    return NextResponse.json(house);
  } catch (error) {
    return NextResponse.json({ error: "Грешка при четене" }, { status: 500 });
  }
}

// 2. PATCH - Обновяване на данни (Редакция)
export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const updated = await prisma.house.update({
      where: { id },
      data: {
        name: body.name,
        area: parseFloat(body.area) || 0,
        bedrooms: parseInt(body.bedrooms) || 0,
        bathrooms: parseInt(body.bathrooms) || 0,
        floors: parseInt(body.floors) || 1,
        price: body.price,
        description: body.description,
        imageUrl: body.imageUrl,
        tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',') : [])
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Грешка при редакция:", error);
    return NextResponse.json({ error: "Грешка при обновяване" }, { status: 500 });
  }
}

// 3. DELETE - Изтриване на къща
export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.house.delete({ where: { id } });
    return NextResponse.json({ message: "Успешно изтрита" });
  } catch (error) {
    console.error("Грешка при изтриване:", error);
    return NextResponse.json({ error: "Грешка при изтриване" }, { status: 500 });
  }
}