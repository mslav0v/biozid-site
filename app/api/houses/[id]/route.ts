import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// РЕДАКТИРАНЕ
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    // Премахваме id от данните, за да не се опита Prisma да го презапише
    const { id: _, ...updateData } = data;

    const house = await prisma.house.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(house);
  } catch (error) {
    return NextResponse.json({ error: "Грешка при обновление" }, { status: 500 });
  }
}

// ИЗТРИВАНЕ
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.house.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Грешка при изтриване" }, { status: 500 });
  }
}