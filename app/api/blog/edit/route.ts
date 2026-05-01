import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Използваме глобален обект, за да не отваряме нови връзки към базата при всяко рестартиране (HMR)
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Взимане на статия за формата
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Проверка дали въобще сме получили ID
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
    // Това ще се изпише в терминала на VS Code
    console.error("DATABASE CRITICAL ERROR:", error.message);
    return NextResponse.json({ error: 'Връзката с базата данни пропадна' }, { status: 500 });
  }
}

// Записване на промените
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, content, imageUrl } = body;

    if (!id) {
      return NextResponse.json({ error: 'Не може да се обнови статия без ID' }, { status: 400 });
    }

    const updated = await prisma.blogPost.update({
      where: { id: id },
      data: { 
        title, 
        content, 
        imageUrl,
        updatedAt: new Date() // Автоматично обновяваме датата на редакция
      },
    });

    console.log(`✅ Статия ${id} е обновена успешно.`);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("UPDATE ERROR:", error.message);
    return NextResponse.json({ error: 'Грешка при запис в базата данни' }, { status: 500 });
  }
}